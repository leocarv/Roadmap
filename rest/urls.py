from rest.handler import URLBuilder
from rest.samplehandlers import \
    DummyHandler, DummyTypeHandler, DummyStuffHandler, SecurityTestHandler
from piston.authentication import HttpBasicAuthentication
from authentication import DjangoAuthentication


auth = [DjangoAuthentication(), HttpBasicAuthentication()]

builder = URLBuilder([('dummy', DummyHandler),
                      ('dummyType', DummyTypeHandler),
                      ('dummy_stuff', DummyStuffHandler),
                      ('security_test', SecurityTestHandler)], 'json', auth)
urlpatterns = builder.get_patterns()
