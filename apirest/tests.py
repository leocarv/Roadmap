# -*- coding: utf-8 -*-
from django.test import TestCase
from django.test.client import Client
from apirest import views
from apirest.models import ProductSpec, Feature, Product, FeatureValue
from django.contrib.auth.models import User
import json
from copy import deepcopy
import mock


class ViewTest(TestCase):

    def setUp(self):
        #Cria o usuario lcarvalho no banco
        self.user = User()
        self.user.username = 'lcarvalho'
        self.user.set_password('lcarvalho')
        self.user.save()

    @mock.patch('apirest.views.render_to_response')
    @mock.patch('apirest.views.django.conf.settings')
    def test_show_system(self, mk_conf, mk_render):
        mk_request = mock.Mock()
        mk_user = mock.Mock()
        mk_user.is_autenticated.return_value = True
        mk_request.user = mk_user

        mk_conf.JS_DEBUG = True
        views.show_system(mk_request)
        mk_render.assert_called_with('apirest/index.html',
                                            {'js_debug': True})

    @mock.patch('apirest.views.render_to_response')
    def test_show_system_with_exception(self, mk_render):
        mk_request = mock.Mock()
        mk_user = mock.Mock()
        mk_user.is_autenticated.return_value = True
        mk_request.user = mk_user

        orig_lib = views.django.conf
        views.django.conf = {'blah': None}
        views.show_system(mk_request)
        mk_render.assert_called_with('apirest/index.html',
                                            {'js_debug': False})
        views.django.conf = orig_lib

    @mock.patch('apirest.views.render_to_response')
    def test_login_failed(self, mk_render):
        mk_request = mock.Mock()
        mk_request.POST = {"username": "no-user",
                           "password": "no-user"}
        views.do_login(mk_request)
        mk_render.assert_called_with('apirest/login.html',
                                   {'error_msg': u'Usuário ou senha inválido'})

    @mock.patch('apirest.views.authenticate')
    @mock.patch('apirest.views.login')
    @mock.patch('apirest.views.HttpResponseRedirect')
    def test_login_sucess(self, mk_response, mk_login, mk_auth):
        login = {"username": "lcarvalho",
                 "password": "lcarvalho"}

        mk_request = mock.Mock()
        mk_request.POST = login
        mk_user = mock.Mock()
        mk_auth.return_value = mk_user

        views.do_login(mk_request)

        mk_auth.assert_called_with(username=login['username'],
                                    password=login['password'])
        mk_login.assert_called_with(mk_request, mk_user)
        mk_response.assert_called_with('/')

    @mock.patch('apirest.views.render_to_response')
    def test_login_get(self, mk_render):
        mk_request = mock.Mock()
        mk_request.method = 'GET'
        mk_request.GET = {"error_msg": "blahmsg"}
        views.do_login(mk_request)
        mk_render.assert_called_with('apirest/login.html',
                                     {'error_msg': "blahmsg"})

    @mock.patch('apirest.views.logout')
    @mock.patch('apirest.views.HttpResponseRedirect')
    def test_logout(self, mk_response, mk_logout):
        login = {"username": "lcarvalho",
                 "password": "lcarvalho"}

        mk_request = mock.Mock()
        mk_request.POST = login

        views.do_logout(mk_request)

        mk_logout.assert_called_with(mk_request)
        mk_response.assert_called_with('/')


class ModelTest(TestCase):

    def setUp(self):
        #Cria um registro de cada tipo
        self.product_spec = ProductSpec.objects.create(
                                        name='prodName')
        self.feature = Feature.objects.create(
                                        product_spec=self.product_spec,
                                        name='featName',
                                        description='descTest')
        self.product = Product.objects.create(
                                        product_spec=self.product_spec,
                                        name='Produto',
                                        price=10)
        self.featurevalue = FeatureValue.objects.create(
                                        product=self.product,
                                        feature=self.feature,
                                        value=50)

    def test_productspec(self):
        tst_ob = ProductSpec.objects.get(pk=self.product_spec.id)
        self.assertEqual(tst_ob.name, 'prodName')
        self.assertEqual(unicode(tst_ob), u'prodName')

    def test_feature(self):
        tst_ob = Feature.objects.get(pk=self.feature.id)
        self.assertEqual(tst_ob.name, 'featName')
        self.assertEqual(unicode(tst_ob), u'featName')

    def test_product(self):
        tst_ob = Product.objects.get(pk=self.product.id)
        self.assertEqual(tst_ob.name, 'Produto')
        self.assertEqual(unicode(tst_ob), u'Produto')

    def test_featurevalue(self):
        tst_ob = FeatureValue.objects.get(pk=self.featurevalue.id)
        self.assertEqual(tst_ob.value, '50')
        self.assertEqual(unicode(tst_ob), u'50')


class ProductSpecHandlerTest(TestCase):

    def setUp(self):
        #Cria o usuario lcarvalho no banco
        self.user = User()
        self.user.username = 'lcarvalho'
        self.user.set_password('lcarvalho')
        self.user.save()

        #realiza o login
        self.login = {'username': 'lcarvalho', 'password': 'lcarvalho'}
        self.c = Client()
        self.c.login(**self.login)

        #Cria um product spec, com duas features associadas
        self.product_spec = ProductSpec.objects.create(
                                                name='prodName')
        self.feature = Feature.objects.create(product_spec=self.product_spec,
                                                name='featName',
                                                description='descTest')
        self.feature2 = Feature.objects.create(product_spec=self.product_spec,
                                                name='featName2',
                                                description='descTest2')

        #Cria outro product spec, com uma feature associada
        self.product_spec2 = ProductSpec.objects.create(name='prodName2')
        self.feature3 = Feature.objects.create(product_spec=self.product_spec2,
                                                name='featName3',
                                                description='descTest3')
        self.feature4 = Feature.objects.create(product_spec=self.product_spec2,
                                                name='featName4',
                                                description='descTest4')
        self.param_test = {
            "feature_set": [
                {
                    "name": "teste",
                    "description": "teste"
                },
                {
                    "name": "teste2",
                    "description": "teste2"
                }
            ],
            "name": "produtoSpec 1"
        }

    def test_get_all(self):
        ret = self.c.get('/apirest/productspec/')
        self.assertEqual(ret.status_code, 200)
        content = json.loads(ret.content)
        self.assertEqual(content[0]['name'], 'prodName')
        self.assertEqual(content[1]['name'], 'prodName2')

    def test_get_one(self):
        ret = self.c.get('/apirest/productspec/5/')
        self.assertEqual(ret.status_code, 404)
        ret = self.c.get('/apirest/productspec/2/')
        self.assertEqual(ret.status_code, 200)
        content = json.loads(ret.content)
        self.assertEqual(content['name'], 'prodName2')

    def test_delete(self):
        ret = self.c.delete('/apirest/productspec/20/')
        self.assertEqual(ret.status_code, 404)
        ret = self.c.delete('/apirest/productspec/2/')
        self.assertEqual(ret.status_code, 204)

    @mock.patch('apirest.handlers.transaction')
    def test_post(self, mk_transaction):
        ret = self.c.post('/apirest/productspec/',
                            json.dumps(self.param_test),
                            content_type='application/json')
        self.assertEqual(ret.status_code, 200)

        ps = ProductSpec.objects.get(name='produtoSpec 1')
        self.assertEqual(ps.name, 'produtoSpec 1')
        self.assertTrue(mk_transaction.commit.called, 'deveria dar commit')

    @mock.patch('apirest.handlers.transaction')
    def test_put(self, mk_transaction):
        #recupera o registro número 2
        ret = self.c.get('/apirest/productspec/2/')
        self.assertEqual(ret.status_code, 200)
        content = json.loads(ret.content)
        self.assertEqual(len(content['feature_set']), 2)

        #altera o registro
        content['name'] = 'prodNameAlterado'  # altera o conteúdo
        del content['feature_set'][1]  # e remove um item filho

        ret = self.c.put('/apirest/productspec/2/',
                        json.dumps(content),
                        content_type='application/json')
        self.assertEqual(ret.status_code, 200)

        content = json.loads(ret.content)
        self.assertEqual(content['name'], 'prodNameAlterado')
        self.assertEqual(len(content['feature_set']), 1)
        self.assertTrue(mk_transaction.commit.called, 'deveria dar commit')

    def test_put_productspec_not_found(self):
        #recupera o registro número 2
        ret = self.c.get('/apirest/productspec/2/')
        self.assertEqual(ret.status_code, 200)
        content = json.loads(ret.content)
        self.assertEqual(len(content['feature_set']), 2)

        ret = self.c.put('/apirest/productspec/40/',
                        json.dumps(content),
                        content_type='application/json')
        self.assertEqual(ret.status_code, 404)


class ProductHandlerTest(TestCase):

    def setUp(self):
        #Cria o usuario lcarvalho no banco
        self.user = User()
        self.user.username = 'lcarvalho'
        self.user.set_password('lcarvalho')
        self.user.save()

        #realiza o login
        self.login = {
            'username': 'lcarvalho',
            'password': 'lcarvalho'
        }
        self.c = Client()
        self.c.login(**self.login)

        #Cria um product spec, com duas features associadas
        self.product_spec = ProductSpec.objects.create(
                                        name='prodName')

        self.feature = Feature.objects.create(
                                        product_spec=self.product_spec,
                                        name='featName',
                                        description='descTest')
        self.feature2 = Feature.objects.create(
                                        product_spec=self.product_spec,
                                        name='featName2',
                                        description='descTest2')

        #cria um product, com suas respectivas feature values
        self.product = Product.objects.create(
                                        product_spec=self.product_spec,
                                        name='Produto',
                                        price=10)
        self.featurevalue = FeatureValue.objects.create(
                                        product=self.product,
                                        feature=self.feature,
                                        value=50)
        self.featurevalue2 = FeatureValue.objects.create(
                                        product=self.product,
                                        feature=self.feature2,
                                        value=150)
        self.param_test = {
            "featurevalue_set": [{
                "value": "200",
                "feature": {"id": 1}
            }, {
                "value": "blue",
                "feature": {"id": 2}
            }],
            "price": "10",
            "product_spec": {"id": 1},
            "name": "produto 1"
        }

    def test_get_all(self):
        ret = self.c.get('/apirest/product/')
        self.assertEqual(ret.status_code, 200)
        content = json.loads(ret.content)
        self.assertEqual(content[0]['name'], 'Produto')

    def test_get_one(self):
        ret = self.c.get('/apirest/product/10/')
        self.assertEqual(ret.status_code, 404)
        ret = self.c.get('/apirest/product/1/')
        self.assertEqual(ret.status_code, 200)
        content = json.loads(ret.content)
        self.assertEqual(content['name'], 'Produto')

    def test_delete(self):
        ret = self.c.delete('/apirest/product/10/')
        self.assertEqual(ret.status_code, 404)
        ret = self.c.delete('/apirest/product/1/')
        self.assertEqual(ret.status_code, 204)

    @mock.patch('apirest.handlers.transaction')
    def test_post(self, mk_transaction):
        # insere o registro
        ret = self.c.post('/apirest/product/',
                            json.dumps(self.param_test),
                            content_type='application/json')
        self.assertEqual(ret.status_code, 200)

        ps = Product.objects.get(name='produto 1')
        self.assertEqual(ps.name, 'produto 1')
        self.assertTrue(mk_transaction.commit.called, 'deveria dar commit')

    def test_post_product_spec_not_found(self):
        #força um product spec inválido
        param_err = deepcopy(self.param_test)
        param_err['product_spec']['id'] = 50
        ret = self.c.post('/apirest/product/',
                            json.dumps(param_err),
                            content_type='application/json')
        self.assertEqual(ret.status_code, 404)

    @mock.patch('apirest.handlers.transaction')
    def test_post_feature_not_found(self, mk_transaction):
        #força um feature value inválido
        param_err = deepcopy(self.param_test)
        param_err['featurevalue_set'][1]['feature']['id'] = 50
        ret = self.c.post('/apirest/product/',
                            json.dumps(param_err),
                            content_type='application/json')
        self.assertEqual(ret.status_code, 404)
        self.assertTrue(mk_transaction.rollback.called,
         'deveria dar rollback')

    @mock.patch('apirest.handlers.transaction')
    def test_put(self, mk_transaction):
        #recupera o registro número 1
        ret = self.c.get('/apirest/product/1/')
        self.assertEqual(ret.status_code, 200)
        content = json.loads(ret.content)
        self.assertEqual(len(content['featurevalue_set']), 2)

        content['name'] = 'produto 1 Alterado'  # altera o conteúdo
        del content['featurevalue_set'][1]  # e remove um item filho
        ret = self.c.put('/apirest/product/1/',
                        json.dumps(content),
                        content_type='application/json')
        self.assertEqual(ret.status_code, 200)

        content = json.loads(ret.content)
        self.assertEqual(content['name'], 'produto 1 Alterado')
        self.assertEqual(len(content['featurevalue_set']), 1)
        self.assertTrue(mk_transaction.commit.called, 'deveria dar commit')

    def test_put_product_not_found(self):
        #recupera o registro número 1
        ret = self.c.get('/apirest/product/1/')
        self.assertEqual(ret.status_code, 200)

        ret = self.c.put('/apirest/product/10/',
                        ret.content,
                        content_type='application/json')
        self.assertEqual(ret.status_code, 404)

    def test_put_productspec_not_found(self):
        #recupera o registro número 1
        ret = self.c.get('/apirest/product/1/')
        self.assertEqual(ret.status_code, 200)
        content = json.loads(ret.content)

        content['product_spec']['id'] = 77
        ret = self.c.put('/apirest/product/1/',
                        json.dumps(content),
                        content_type='application/json')
        self.assertEqual(ret.status_code, 404)

    @mock.patch('apirest.handlers.transaction')
    def test_put_feature_not_found(self, mk_transaction):
        #recupera o registro número 1
        ret = self.c.get('/apirest/product/1/')
        self.assertEqual(ret.status_code, 200)
        content = json.loads(ret.content)
        content['featurevalue_set'][1]['feature']['id'] = 77

        ret = self.c.put('/apirest/product/1/',
                        json.dumps(content),
                        content_type='application/json')
        self.assertEqual(ret.status_code, 404)
        self.assertTrue(mk_transaction.rollback.called,
                        'deveria dar rollback')
