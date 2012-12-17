# encoding: utf-8
from django.http import HttpResponse
from piston.handler import BaseHandler
from rest.utils import rc
from django.db import transaction
from django.conf.urls.defaults import patterns, url
from django.db.models.fields import FieldDoesNotExist
from django.db.models.fields.related import ForeignKey, \
                                        SingleRelatedObjectDescriptor,\
                                        ReverseSingleRelatedObjectDescriptor
from django.db.models import OneToOneField
import django.db.models
from django.db.models.query import QuerySet
from rest.resource import ExtResource
from piston.emitters import Emitter, JSONEmitter
from piston.utils import Mimer
import json
from actstream import action
from rest.decorators import permissions_required


def jquery_json_loads(*args, **kwargs):
    return json.loads(*args, **kwargs)


Emitter.register('json_upload', JSONEmitter, 'text/html; charset=utf-8')
Mimer.register(jquery_json_loads,
                ('application/json', 'application/json; charset=UTF-8',))


class RequestError(Exception):
    """
    A class to control the execution flow exception of a request
    """
    def __init__(self, msg, return_code):
        self.msg = msg
        self.return_code = return_code


class BaseHandler(BaseHandler):

    update_fields = None
    permissions = None
    select_related = False
    actstream_verbs = {
        'delete': 'apagou',
        'create': 'criou',
        'update': 'alterou'
    }
    select_related = True

    def __init__(self, *args, **kwargs):
        super(BaseHandler, self).__init__()

        if self.select_related and hasattr(self, 'model') \
            and not hasattr(self, 'select_related_fields'):
            self.select_related_fields = self.get_select_related_fields()

    def get_select_related_fields(self):
        related_fields = ()

        for field in self.fields:
            if isinstance(field, str):
                field_name = field
            if isinstance(field, tuple):
                field_name = field[0]

            try:
                model_field = self.model._meta.get_field_by_name(field_name)[0]
            except FieldDoesNotExist:
                continue

            if isinstance(model_field, ForeignKey):
                related_fields = related_fields + (field_name,)

        return related_fields

    def _update_object(self, model, data, request=None):
        """
        Updates the given model object with the data dict.

        Only the attributes listed in update_fields ll be considered
        when creating/updating a model
        """
        if not self.update_fields:
            msg = '%s.update_fiels is not defined' % self.__class__.__name__
            raise RequestError(msg, rc.NOT_IMPLEMENTED.status_code)

        fks = [i for i in data if i[-3:] == '_id']
        update_fields = list(self.update_fields) + fks

        for att in update_fields:
            if att not in data:
                continue
            value = data.get(att)
            # many-to-many must be threated after a pk
            if isinstance(value, list):
                modelatt = getattr(self.model, att)
                if hasattr(modelatt, 'field') \
                or (hasattr(modelatt, 'related') \
                and hasattr(modelatt.related, 'field')):
                    continue

            # one-to-one must get the object, do not use the ID
            if att[-3:] == '_id':
                att = att[:-3]
                # dict has priority to represents a relation
                if att in data:
                    continue

            try:
                cls_att = model.__class__._meta.get_field_by_name(att)[0]
                relation_classes = (ForeignKey, OneToOneField,
                                        SingleRelatedObjectDescriptor,
                                        ReverseSingleRelatedObjectDescriptor)

                if isinstance(cls_att, relation_classes) and not value:
                    value = None

                if isinstance(cls_att, relation_classes) and value is not None:
                    related_cls = cls_att.rel.to
                    if isinstance(value, dict):
                        value = value['id']
                    value = related_cls.objects.get(pk=int(value))
            except django.db.models.exceptions.ObjectDoesNotExist, e:
                raise
            except Exception, e:
                pass

            setattr(model, att, value)
        return model

    def _update_many_to_many_fields(self, model, data):
        if not self.update_fields:
            msg = '%s.update_fiels is not defined' % self.__class__.__name__
            raise RequestError(msg, rc.NOT_IMPLEMENTED.status_code)

        for att in self.update_fields:
            if att not in data:
                continue

            value = data.get(att)
            if isinstance(value, list):
                modelatt = getattr(self.model, att)
                if hasattr(modelatt, 'field'):
                    field = modelatt.field
                    relmodel = field.rel.to
                elif hasattr(modelatt, 'related') \
                and hasattr(modelatt.related, 'field'):
                    field = modelatt.related.field
                    relmodel = modelatt.related.model
                else:
                    continue
                value = relmodel.objects.filter(pk__in=[i['id'] \
                                                    for i in value])
                setattr(model, att, value)
        return model

    def _get_model_object(self, request, **kwargs):
        """
        Gets the model object based on args and kwargs

        If no model could be found, a new one is returned
        """
        if not self.has_model():
            raise RequestError(
                'No model defined', rc.NOT_IMPLEMENTED.status_code)

        if not kwargs:
            return self.model(), True

        try:
            return self.queryset(request).get_or_create(**kwargs)
        except self.model.MultipleObjectsReturned:
            msg = 'Multiple objects returned'
            raise RequestError(msg, rc.DUPLICATE_ENTRY.status_code)

    def log(self, verb, target, actor, description=None):
        """
        Simple method to log the activity
        """

        if not description:
            description = unicode(target)

        if not actor.is_anonymous():
            action.send(
                actor,
                verb=verb,
                target=target,
                description=description)

    def filter_queryset(self, request, queryset):
        '- filter=[{"property": "property_name", "value": "filter value"}]'
        filters = request.GET.get('filter')
        if filters:
            filters = json.loads(filters)
            kwfilter = {}
            for f in filters:
                prop = f['property']
                val = f['value']
                kwfilter[prop] = val
            return queryset.filter(**kwfilter)
        return queryset

    def sort_queryset(self, request, queryset):
        '''
        - sort=property_name&dir=asc
        - sort=[{"property": "name", "direction": "asc"}]
        '''
        sortkey = request.GET.get('sort')
        if sortkey:
            try:
                sortby = json.loads(sortkey)
            except:
                sortby = [{'property': sortkey,
                            'direction': request.GET.get('dir')}]
            final_sorting = []
            for order in sortby:
                direction = order.get('direction', 'ASC')
                prop = order.get('property')
                if direction.upper().strip() == 'DESC':
                    prop = '-' + prop
                final_sorting.append(prop)
            queryset = queryset.order_by(*final_sorting)
        return queryset

    def limit_queryset(self, request, queryset):
        '''
        - limit=10
        - start=0
        '''
        limit = request.GET.get('limit', None)
        start = int(request.GET.get('start', 0))
        end = None
        if limit:
            end = start + int(limit)
        return queryset[start:end]

    def get_select_related_queryset(self, queryset):
        return queryset.select_related(*self.select_related_fields)

    def update_queryset(self, request, queryset, **kwargs):
        return queryset

    def queryset(self, request):
        queryset = super(BaseHandler, self).queryset(request)

        if(self.select_related):
            queryset = self.get_select_related_queryset(queryset)

        queryset = self.update_queryset(request, queryset)

        return queryset

    @permissions_required()
    def read(self, request, *args, **kwargs):
        queryset = super(BaseHandler, self).read(request, *args, **kwargs)
        if isinstance(queryset, QuerySet):
            queryset = self.filter_queryset(request, queryset)
            queryset = self.sort_queryset(request, queryset)
            total = queryset.count()
            queryset = self.limit_queryset(request, queryset)

            return dict(total=total, result=queryset)
        else:
            return dict(result=queryset)

    @transaction.commit_on_success
    @permissions_required()
    def create(self, request, *args, **kwargs):
        """
        Do the job of a POST request :)
        """
        try:
            obj, created = self._get_model_object(request, **kwargs)
            if not created:
                msg = 'Object %s already exists' % obj
                raise RequestError(msg, rc.DUPLICATE_ENTRY.status_code)

            self._update_object(obj, request.POST, request)
            obj.save()
            self._update_many_to_many_fields(obj, request.POST)
            obj.save()  # TODO isso é necessário?

            #logging the activy
            self.log(
                    actor=request.user,
                    verb=self.actstream_verbs.get('create'),
                    target=obj)

            return {'result': obj}

        except RequestError, e:
            resp = HttpResponse()
            resp.status_code = e.return_code
            resp.write(e.msg)
            return resp

    @transaction.commit_on_success
    @permissions_required()
    def update(self, request, *args, **kwargs):
        try:
            obj, created = self._get_model_object(request, **kwargs)
            if created:
                # TODO organizar isso
                raise RequestError('', rc.NOT_FOUND.status_code)

            self._update_object(obj, request.PUT, request)
            obj.save()
            self._update_many_to_many_fields(obj, request.PUT)
            obj.save()  # TODO isso é necessário?

            #logging the activy
            self.log(
                    actor=request.user,
                    verb=self.actstream_verbs.get('update'),
                    target=obj)

            # TODO isso vai no emitter
            return {'result': obj}
        except RequestError, e:
            resp = HttpResponse()
            resp.status_code = e.return_code
            resp.write(e.msg)
            return resp

    @permissions_required()
    def delete(self, request, *args, **kwargs):
        verb = self.actstream_verbs.get('delete')
        inst = None
        try:
            inst = self.queryset(request).get(**kwargs)
        except Exception as e:
            pass

        ret = super(BaseHandler, self).delete(request, *args, **kwargs)

        if ret.status_code == rc.DELETED.status_code:
            self.log(
                    actor=request.user,
                    verb=verb,
                    target=inst,
                    description=inst)

        return ret


class URLBuilder(object):
    """
    Build the URLs for the given resources as [(url, handler), ...]
    """
    def __init__(self, resources, emitter='json', auth=None):
        self.resources = resources
        self.emitter = emitter
        self.auth = auth

    def get_patterns(self):
        pattern_list = patterns('')
        emitter = {'emitter_format': self.emitter}
        kwargs = {}

        for name, handler in self.resources:
            r = ExtResource(handler, self.auth)
            u1 = url('^%s/(?P<id>[0-9]+)' % name,
                            r, emitter)
            u2 = url('^%s$' % name, r, emitter)
            pattern_list += patterns('', u1, u2)
        return pattern_list
