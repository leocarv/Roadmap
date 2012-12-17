from apirest.handlers import ProductSpecHandler, ProductHandler
from django.conf.urls import *
from piston.authentication import HttpBasicAuthentication
from rest.authentication import DjangoAuthentication
from rest.resource import ExtResource

json_format = {'emitter_format': 'json'}

auth = [DjangoAuthentication(), HttpBasicAuthentication()]

productspec_resource = ExtResource(ProductSpecHandler, auth)
product_resource = ExtResource(ProductHandler, auth)

urlpatterns = patterns('',
    url(r'^product/(?P<id>[^/]+)', product_resource, json_format),
    url(r'^product/', product_resource, json_format),
    url(r'^productspec/(?P<id>[^/]+)', productspec_resource, json_format),
    url(r'^productspec/', productspec_resource, json_format),
)

urlpatterns += patterns('',
    url(r'login', 'apirest.views.do_login'),
    url(r'logout', 'apirest.views.do_logout')
)
