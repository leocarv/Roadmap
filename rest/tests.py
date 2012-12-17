from django.test import TestCase
from django.test.client import Client
from rest.handler import BaseHandler, URLBuilder
from rest.decorators import permissions_required
from rest.samplehandlers import DummyHandler
from rest.models import Dummy, DummyType, DummyStuff, SecurityTest
from django.forms import model_to_dict
from rest.utils import XFormatUnicode
import json
from django.contrib import auth
from actstream.models import actor_stream
from mock import Mock


class DownloadCsvView(TestCase):
    def test_get(self):
        c = Client()
        c.login(username='admin', password='admin')

        filename = 'test'
        content = 'testContent'

        ret = c.get('/download_csv?filename=%s&content=%s' % \
            (filename, content))

        self.assertEquals(ret.status_code, 200)
        self.assertEquals(ret.__getitem__('Content-Disposition'),
            'attachment; filename="%s.csv"' % filename)
        self.assertEquals(ret.__getitem__('content-type'),
            'application/vnd.ms-excel')
        self.assertEquals(ret.content,
            'testContent')

    def test_get_data_missing(self):
        c = Client()
        c.login(username='admin', password='admin')

        filename = 'test'
        content = 'test'

        ret = c.get('/download_csv')
        self.assertEquals(ret.status_code, 400)

        ret = c.get('/download_csv?filename=%s' % filename)
        self.assertEquals(ret.status_code, 400)

        ret = c.get('/download_csv?content=%s' % content)
        self.assertEquals(ret.status_code, 400)

    def test_post(self):
        c = Client()
        c.login(username='admin', password='admin')

        filename = 'test'
        content = 'test'

        ret = c.post('/download_csv',
            {'filename': filename, 'content': content})

        self.assertEquals(ret.status_code, 200, ret.content)
        self.assertEquals(ret.__getitem__('Content-Disposition'),
            'attachment; filename="%s.csv"' % filename)
        self.assertEquals(ret.__getitem__('content-type'),
            'application/vnd.ms-excel')

    def test_post_data_missing(self):
        c = Client()
        c.login(username='admin', password='admin')

        filename = 'test'
        content = 'test'

        ret = c.post('/download_csv')
        self.assertEquals(ret.status_code, 400)

        ret = c.post('/download_csv',
            {filename: filename})
        self.assertEquals(ret.status_code, 400)

        ret = c.post('/download_csv',
            {content: content})
        self.assertEquals(ret.status_code, 400)

    def test_wrong_methods(self):
        c = Client()
        c.login(username='admin', password='admin')

        filename = 'test'
        content = 'test'

        ret = c.put('/download_csv')
        self.assertEquals(ret.status_code, 405, ret.content)

        ret = c.delete('/download_csv')
        self.assertEquals(ret.status_code, 405, ret.content)


class PermissionsRequiredDecoratorTest(TestCase):
    request = Mock()

    @permissions_required('test permission')
    def func(self, request, arg1, arg2):
        return True

    def test_access_denied(self):
        self.request.user.has_perms = Mock(return_value=False)
        result = self.func(self.request, 'a', 'b')
        self.assertEquals(result.status_code, 401)

    def test_access_allowed(self):
        self.request.user.has_perms = Mock(return_value=True)
        result = self.func(self.request, 'a', 'b')
        self.assertTrue(result)


class SelectRelatedFieldsTest(TestCase):
    def setUp(self):
        self.previous_select_related = DummyHandler.select_related

    def tearDown(self):
        DummyHandler.select_related = self.previous_select_related

    def test_get_select_related_fields_default(self):
        h = DummyHandler()
        self.assertEquals(h.select_related_fields, ('dummy_type',))

    def test_get_select_related_fields_on_init(self):
        previous_get_srf = DummyHandler.get_select_related_fields

        DummyHandler.get_select_related_fields = Mock()

        DummyHandler.select_related = False
        h = DummyHandler()
        self.assertTrue(not DummyHandler.get_select_related_fields.called)

        DummyHandler.select_related = True
        h = DummyHandler()
        self.assertTrue(DummyHandler.get_select_related_fields.called)

        DummyHandler.get_select_related_fields = previous_get_srf

    def test_queryset_calls_select_related(self):
        previous_get_srf = DummyHandler.get_select_related_fields

        get_select_related_queryset_method = \
            DummyHandler.get_select_related_queryset
        DummyHandler.get_select_related_queryset = Mock()

        DummyHandler.select_related = False
        h = DummyHandler()
        h.queryset(Mock())
        self.assertTrue(
            not DummyHandler.get_select_related_queryset.called)

        DummyHandler.select_related = True
        h = DummyHandler()
        h.queryset(Mock())
        self.assertTrue(DummyHandler.get_select_related_queryset.called)

        queryset_mock = Mock()
        get_select_related_queryset_method(h, queryset_mock)
        queryset_mock.select_related.assert_called_with(
            *h.select_related_fields)

        DummyHandler.get_select_related_fields = previous_get_srf
        DummyHandler.get_select_related_queryset = \
            get_select_related_queryset_method


class HandlersTest(TestCase):
    fixtures = ['basic_auth', 'basic_tests', 'user.yaml', 'simple_test.yaml']

    def test_get_without_permission(self):
        c = Client()
        c.login(username='nonadmin', password='nonadmin')

        dummy_stuff = {'name': 'ignored', 'dummy_set': [{'name': 'name',
                       'dummy_type': {'id': 1, 'name': 'foo'}}]}
        response = c.post('/rest/dummy_stuff', json.dumps(dummy_stuff),
                       content_type='application/json', follow=True)
        self.assertTrue(response.status_code, 200)

    def test_permission_allowed(self):
        c = Client()
        c.login(username='nonadmin', password='nonadmin')
        response = c.delete('/rest/security_test/1')
        self.assertEquals(response.status_code, 204)
        st = SecurityTest.objects.filter(pk=1)
        self.assertEquals(len(st), 0)

    def test_get_permission_denied(self):
        c = Client()
        c.login(username='nonadmin', password='nonadmin')
        response = c.get('/rest/dummy')
        self.assertEquals(response.status_code, 401)

    def test_put_permission_denied(self):
        c = Client()
        c.login(username='nonadmin', password='nonadmin')
        response = c.put('/rest/dummy/1')
        self.assertEquals(response.status_code, 401)

    def test_post_permission_denied(self):
        c = Client()
        c.login(username='nonadmin', password='nonadmin')
        response = c.post('/rest/dummy')
        self.assertEquals(response.status_code, 401)

    def test_delete_permission_denied(self):
        c = Client()
        c.login(username='nonadmin', password='nonadmin')
        response = c.delete('/rest/dummy/1')
        self.assertEquals(response.status_code, 401)

    def test_method_overwrite_permission_denied(self):
        c = Client()
        c.login(username='nonadmin', password='nonadmin')
        response = c.get('/rest/security_test')
        self.assertEquals(response.status_code, 500)

    def test_fixtures_len(self):
        d = Dummy.objects.all()

        self.assertEquals(len(d), 2)
        self.assertEquals(d[0].dummy_stuff.count(), 2)
        self.assertEquals(d[1].dummy_stuff.count(), 1)
        self.assertEquals(d[0].dummy_type.id, 1)
        self.assertEquals(d[1].dummy_type.id, 2)

    def test_get_dummy_list(self):
        c = Client()
        c.login(username='admin', password='admin')
        response = c.get('/rest/dummy')
        self.assertEquals(response.status_code, 200)
        data = json.loads(response.content)

        self.assertEquals(len(data), 2)

    def test_get_dummy_list_filtering_by_exact_name(self):
        c = Client()
        c.login(username='admin', password='admin')
        url = '/rest/dummy?filter=[{"property": "name",'\
        ' "value": "My dummy 1"}]'
        response = c.get(url)
        self.assertEquals(response.status_code, 200)
        data = json.loads(response.content)

        self.assertEquals(data['total'], 1)
        self.assertEquals(len(data['result']), 1)

    def test_get_dummy_list_sorted_by_name_asc(self):
        c = Client()
        c.login(username='admin', password='admin')
        response = c.get(
            '/rest/dummy?sort=[{"property": "name", "direction": "ASC"}]')
        self.assertEquals(response.status_code, 200)
        data = json.loads(response.content)

        self.assertEquals(len(data), 2)

        # checking if its sorted
        last = None
        for i in data['result']:
            if last is None:
                last = i
                continue
            self.assertTrue(i['name'] > last['name'],
                '%s and %s not sorted' % (i['name'], last['name']))

    def test_get_dummy_list_sorted_by_name_desc(self):
        c = Client()
        c.login(username='admin', password='admin')
        response = c.get(
            '/rest/dummy?sort=[{"property":"name", "direction":"DESC"}]')
        self.assertEquals(response.status_code, 200)
        data = json.loads(response.content)

        self.assertEquals(len(data), 2)

        # checking if its sorted
        last = None
        for i in data['result']:
            if last is None:
                last = i
                continue
            self.assertTrue(i['name'] < last['name'],
                '%s and %s not sorted' % (i['name'], last['name']))

    def test_get_dummy_list_sorted_by_name_asc_offsetting_and_limiting_1(self):
        c = Client()
        c.login(username='admin', password='admin')
        response = c.get(
            '/rest/dummy?sort=[{"property":"name", "direction":"asc"}]'
            '&limit=1&start=1')
        self.assertEquals(response.status_code, 200)
        data = json.loads(response.content)

        self.assertEquals(len(data['result']), 1)
        self.assertEquals(data['total'], 2)
        self.assertEquals(data['result'][0]['name'], u'My dummy 2')

    def test_get_dummy_list_limit(self):
        c = Client()
        c.login(username='admin', password='admin')
        response = c.get('/rest/dummy?limit=1')
        self.assertEquals(response.status_code, 200, response.content)

        data = json.loads(response.content)
        self.assertEquals(len(data['result']), 1)

    def test_get_dummy_list_limit_and_offset(self):
        c = Client()
        c.login(username='admin', password='admin')

        # first request, to assert that we do not get the same object
        # if we send the offset in the second request
        response = c.get('/rest/dummyType?limit=1')
        self.assertEquals(response.status_code, 200, response.content)

        data1 = json.loads(response.content)
        self.assertEquals(len(data1['result']), 1)

        response = c.get('/rest/dummyType?limit=1&start=1')
        self.assertEquals(response.status_code, 200, response.content)

        data2 = json.loads(response.content)
        self.assertEquals(len(data2['result']), 1)
        self.assertNotEquals(data1['result'][0]['id'],
            data2['result'][0]['id'])

    def test_get_dummy_list_with_limit_out_of_bounds(self):
        c = Client()
        c.login(username='admin', password='admin')

        response = c.get('/rest/dummyType?start=10000&limit=1')
        self.assertEquals(response.status_code, 200, response.content)

        data = json.loads(response.content)
        self.assertEquals(len(data['result']), 0)

    def test_get_dummy_single(self):
        c = Client()
        c.login(username='admin', password='admin')
        response = c.get('/rest/dummy/1', follow=True)

        self.assertEquals(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue(isinstance(data, dict))
        self.assertEquals(data['result']['id'], 1)

    def test_put_dummy_with_nested_relations(self):
        name = 'my other dummy'
        typeid = 1
        stuffids = [1, 2]
        data = dict(name=name,
                    dummy_type={'id': typeid, 'name': 'foo'},
                    dummy_stuff=[dict(id=i, name='ignored') for i in stuffids])

        c = Client()
        c.login(username='admin', password='admin')
        response = c.put('/rest/dummy/1', json.dumps(data),
                            content_type='application/json', follow=True)
        self.assertTrue(response.status_code, 200)

        data = json.loads(response.content)['result']
        self.assertEquals(data['id'], 1)
        self.assertEquals(data['dummy_type']['id'], typeid)
        self.assertEquals(len(data['dummy_stuff']), 2)

        for stuffid in set(i['id'] for i in data['dummy_stuff']):
            self.assertTrue(stuffid in stuffids)

    def test_put_dummy_stuff_backref(self):
        c = Client()
        c.login(username='admin', password='admin')
        dummy_stuff = {'id': 1, 'name': 'ignored',
                'dummy_set': [{'id': 1, 'name': 'name',
                'dummy_type': {'id': 1, 'name': 'foo'}}]}
        response = c.put('/rest/dummy_stuff/1', json.dumps(dummy_stuff),
                content_type='application/json', follow=True)

        response = json.loads(response.content)
        dummy_stuff = {'id': 1, 'name': 'ignored', 'dummy_set': []}
        self.assertEquals(len(response['result']['dummy_set']), 1)

        response = c.put('/rest/dummy_stuff/1', json.dumps(dummy_stuff),
                content_type='application/json', follow=True)
        self.assertTrue(response.status_code, 200)
        response = json.loads(response.content)
        self.assertEquals(len(response['result']['dummy_set']), 0)

    def test_post_dummy_stuff_backref(self):
        c = Client()
        c.login(username='admin', password='admin')

        dummy_stuff = {'name': 'ignored', 'dummy_set': [{'name': 'name',
                   'dummy_type': {'id': 1, 'name': 'foo'}}]}
        response = c.post('/rest/dummy_stuff', json.dumps(dummy_stuff),
                    content_type='application/json', follow=True)
        self.assertTrue(response.status_code, 200)

    def test_post_dummy_with_empty_string_as_id(self):
        name = 'my post stuff'
        data = dict(name=name, dummy_type_id="")

        c = Client()
        c.login(username='admin', password='admin')
        response = c.post('/rest/dummy', json.dumps(data),
                            content_type='application/json', follow=True)

        self.assertTrue(response.status_code, 200)

    def test_post_dummy_with_nested_relations(self):
        name = 'my post stuff'
        typeid = 2
        stuffids = [3, 4]
        data = dict(name=name,
                    dummy_type={'id': typeid, 'name': 'foo'},
                    dummy_stuff=[dict(id=i, name='ignored') for i in stuffids])

        c = Client()
        c.login(username='admin', password='admin')
        response = c.post('/rest/dummy', json.dumps(data),
                            content_type='application/json', follow=True)
        self.assertTrue(response.status_code, 200)

        data = json.loads(response.content)['result']
        self.assertTrue(data['id'] > 2)  # already has 2 fixtures
        self.assertEquals(data['dummy_type']['id'], typeid)
        self.assertEquals(len(data['dummy_stuff']), 2)

        for stuffid in set(i['id'] for i in data['dummy_stuff']):
            self.assertTrue(stuffid in stuffids)

    def test_relations_with_id_att(self):
        name = 'my foo dummy'
        data = dict(name=name,
                    dummy_type_id=1)

        c = Client()
        c.login(username='admin', password='admin')
        response = c.post('/rest/dummy', json.dumps(data),
                            content_type='application/json', follow=True)
        self.assertTrue(response.status_code, 200)

        data = json.loads(response.content)['result']
        self.assertEquals(data['dummy_type']['id'], 1)

    def test_put_relations_with_id_att(self):
        name = 'my foo dummy'
        data = dict(name=name,
                    dummy_type_id=2)

        c = Client()
        c.login(username='admin', password='admin')
        response = c.put('/rest/dummy/1', json.dumps(data),
                            content_type='application/json', follow=True)
        self.assertTrue(response.status_code, 200)
        data = json.loads(response.content)['result']
        self.assertEquals(data['dummy_type']['id'], 2)

    def test_relations_with_dict_priority(self):
        name = 'my foo dummy'
        data = dict(name=name,
                    dummy_type_id=1,
                    dummy_type={'id': 2})

        c = Client()
        c.login(username='admin', password='admin')
        response = c.post('/rest/dummy', json.dumps(data),
                            content_type='application/json', follow=True)
        self.assertTrue(response.status_code, 200)

        data = json.loads(response.content)['result']
        self.assertEquals(data['dummy_type']['id'], 2)

    def test_post_failure_to_a_given_id(self):
        name = 'my post stuff'
        typeid = 2
        stuffids = [3, 4]
        data = dict(name=name,
                    dummy_type={'id': typeid, 'name': 'foo'},
                    dummy_stuff=[dict(id=i, name='ignored') for i in stuffids])

        c = Client()
        response = c.post('/rest/dummy/1/', json.dumps(data),
                            content_type='application/json', follow=True)
        self.assertTrue(response.status_code != 200)

    def test_self_one_to_one_relation_saving(self):
        name1 = 'my dummy type 1'
        name2 = 'my other dummy type 2'

        type1 = {'name': name1}
        type2 = {'name': name2, 'clearof': None}

        c = Client()
        c.login(username='admin', password='admin')
        response = c.post('/rest/dummyType', json.dumps(type1),
                            content_type='application/json', follow=True)
        self.assertEquals(response.status_code, 200, response.content)

        saved_type1 = json.loads(response.content)['result']
        type2['clearof'] = saved_type1

        response = c.post('/rest/dummyType', json.dumps(type2),
                            content_type='application/json', follow=True)
        self.assertEquals(response.status_code, 200, response.content)
        saved_type2 = json.loads(response.content)['result']

        self.assertEquals(saved_type2['clearof']['id'], saved_type1['id'])

    def test_url_builder(self):
        b = URLBuilder([('dummy', DummyHandler)])
        self.assertEquals(len(b.get_patterns()), 2)

    def test_nullable_foreign_key(self):
        type1 = {'name': 'Nome', 'clearof': None}

        c = Client()
        c.login(username='admin', password='admin')
        response = c.post('/rest/dummyType', json.dumps(type1),
                            content_type='application/json', follow=True)

        self.assertEquals(response.status_code, 200, response.content)

    def test_post_actstream(self):
        data = dict(name='My dummy 12354',
                    dummy_type={'id': 1})

        c = Client()
        c.login(username='admin', password='admin')
        user = auth.get_user(c)

        response = c.post('/rest/dummy', json.dumps(data),
                            content_type='application/json', follow=True)
        data = json.loads(response.content)['result']

        action = actor_stream(user)[0]
        self.assertEquals(action.actor, user)
        self.assertEquals(action.verb, 'criou')
        self.assertEquals(action.target.pk, data['id'])

    def test_put_actstream(self):
        data = dict(name='My other dummy')

        c = Client()
        c.login(username='admin', password='admin')
        user = auth.get_user(c)

        response = c.put('/rest/dummy/1', json.dumps(data),
                            content_type='application/json', follow=True)

        action = actor_stream(user)[0]
        self.assertEquals(action.actor, user)
        self.assertEquals(action.verb, 'alterou')
        self.assertEquals(action.target.pk, 1)

    def test_delete_actstream(self):
        data = dict(name='My dummy one more',
                    dummy_type={'id': 1})

        c = Client()
        c.login(username='admin', password='admin')
        user = auth.get_user(c)

        response = c.post('/rest/dummy', json.dumps(data),
                            content_type='application/json', follow=True)
        content = json.loads(response.content)['result']
        id = content['id']
        response = c.delete('/rest/dummy/%d' % id)

        action = actor_stream(user)[0]
        self.assertEquals(action.actor, user)
        self.assertEquals(action.verb, 'apagou')
        self.assertEquals(action.description, 'Dummy object')

    def test_custom_delete_actstream(self):

        c = Client()
        c.login(username='admin', password='admin')
        user = auth.get_user(c)

        dt = DummyType.objects.get(pk=1)

        response = c.delete('/rest/dummyType/%d' % dt.id)
        self.assertEquals(response.status_code, 204, response.content)

        action = actor_stream(user)[0]
        self.assertEquals(action.actor, user)
        self.assertEquals(action.verb, 'delete')

    def test_custom_post_actstream(self):
        data = dict(name='New dummy type')

        c = Client()
        c.login(username='admin', password='admin')
        user = auth.get_user(c)

        response = c.post('/rest/dummyType', json.dumps(data),
                            content_type='application/json', follow=True)
        data = json.loads(response.content)['result']

        action = actor_stream(user)[0]
        self.assertEquals(action.actor, user)
        self.assertEquals(action.verb, 'create')
        self.assertEquals(action.target.pk, data['id'])

    def test_custom_put_actstream(self):
        data = dict(name='Alter dummy type')

        c = Client()
        c.login(username='admin', password='admin')
        user = auth.get_user(c)

        response = c.put('/rest/dummyType/1', json.dumps(data),
                            content_type='application/json', follow=True)

        action = actor_stream(user)[0]
        self.assertEquals(action.actor, user)
        self.assertEquals(action.verb, 'update')
        self.assertEquals(action.target.pk, 1)


class RegexableFormattingUnicodeTest(TestCase):

    def test_overwritten_format_method(self):
        s = XFormatUnicode(u'Thiago fraz\xe3o')
        self.assertTrue(isinstance(s, unicode))
        self.assertEquals(u'Thiago fraz\xe3o', s)

    def test_finds_right_formatting_string_re(self):
        s = XFormatUnicode(u'Thiago fraz\xe3o')

        test_format = 're("my pattern", 1)'
        self.assertTrue(s._format_regex.match(test_format))

    def test_does_not_find_formatting_string_re(self):
        s = XFormatUnicode(u'Thiago fraz\xe3o')

        test_format = 'test("bla", 2)'
        self.assertFalse(s._format_regex.match(test_format))

    def test_format_magic_method_with_regex(self):
        m = Mock()
        s = XFormatUnicode(u'Thiago fraz\xe3o')
        s._do_formatting = m
        s._do_formatting.return_value = ''

        'bla {0:re("my pattern 123", 66)}'.format(s)

        m.assert_called_with('my pattern 123', 66)

    def test_format_magic_method_without_regex_complex(self):
        m = Mock()
        s = XFormatUnicode(u'bla')
        s._do_formatting = m
        s._do_formatting.return_value = ''

        ret = u'{0:^10}'.format(s)

        m.assert_not_called()
        self.assertEquals(ret, '   bla    ')

    def test_format_magic_method_without_regex_simple(self):
        m = Mock()
        s = XFormatUnicode(u'thiago fraz\xe3o')
        s._do_formatting = m
        s._do_formatting.return_value = ''

        ret = u'bla {0}'.format(s)

        m.assert_not_called()
        self.assertEquals(ret, 'bla ' + s)

    def test_do_formatting_method_simple_usage(self):
        s = u'source=RJO-TP001-SDH001 location=8-N2SL64-1(SDH-1)-SPI:1'
        s = XFormatUnicode(s)
        ret = s._do_formatting("^source=(.*)\s*location=(.*)$", 1)

        self.assertEquals(ret, '8-N2SL64-1(SDH-1)-SPI:1')

    def test_error_formatting_with_message_and_no_details(self):
        s = u'source=RJO-TP001-SDH001 location=8-N2SL64-1(SDH-1)-SPI:1'
        s = XFormatUnicode(s, format_error_msg='Error formatting')
        tpl = 'Value: {0:re("regex teste", a)}'

        self.assertEquals(tpl.format(s), 'Value: Error formatting')

    def test_error_formatting_with_message_with_all_details(self):
        s = u'Not valid match'
        err = 'Error. Original value: {original_value}'
        s = XFormatUnicode(s, format_error_msg=err)

        tpl = 'Value: {0:re("regex teste", a)}'

        self.assertEquals(tpl.format(s),
                'Value: Error. Original value: Not valid match')

    def test_error_formatting_with_message_with_all_details(self):
        s = u'Not valid match'
        s = XFormatUnicode(s)

        tpl = 'Value: {0:re("regex teste", a)}'
        self.assertEquals(tpl.format(s),
                'Value: Not valid match')

    def test_end_to_end_success_execution(self):
        got = XFormatUnicode('source=SPO-TP001-SDH001 location=sao paulo')
        tpl = 'Got value: {value:re("^source=(.*)\s*location=(.*)$",1)}'
        self.assertEquals(tpl.format(value=got), 'Got value: sao paulo')
