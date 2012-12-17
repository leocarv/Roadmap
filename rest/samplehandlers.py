from rest.models import Dummy, DummyType, DummyStuff, SecurityTest
from rest.handler import BaseHandler
from rest.decorators import permissions_required
from django.db.models.query import QuerySet


class DummyHandler(BaseHandler):
    allowed_methods = ('GET', 'POST', 'PUT', 'DELETE')

    permissions = {'GET': ['get', 'get'],
                   'POST': 'post',
                   'PUT': 'put',
                   'DELETE': 'delete'}

    fields = ('id', 'name',
                ('dummy_type', ('id', 'name')),
                ('dummy_stuff', ('id', 'name')), )

    model = Dummy
    update_fields = ('id', 'name', 'dummy_type',
        'dummy_stuff', 'dummy_type_id')


class DummyStuffHandler(BaseHandler):
    allowed_methods = ('GET', 'POST', 'PUT', 'DELETE')
    fields = ('id', 'name',
                ('dummy_set', ('id', 'name')))
    model = DummyStuff
    update_fields = ('id', 'name', 'dummy_set')


class DummyTypeHandler(BaseHandler):
    allowed_methods = ('GET', 'POST', 'PUT', 'DELETE')
    fields = ('id', 'name',
                ('clearof', ('id', 'name')),
                ('clearedby', ('id', 'name')), )

    model = DummyType
    update_fields = ('id', 'name', 'clearof')
    actstream_verbs = {
        'delete': 'delete',
        'create': 'create',
        'update': 'update'
    }


class SecurityTestHandler(BaseHandler):
    allowed_methods = ('GET', 'DELETE')

    fields = ('id', 'name')

    permissions = {'GET': 'unique permission',
                   'DELETE': 'admin.change_logentry'}

    model = SecurityTest

    @permissions_required('permission 2')
    def read(self, request, *args, **kwargs):
        return super(SecurityTestHandler, self).read(request, *args, **kwargs)
