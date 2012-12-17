from django.conf.urls import patterns, include, url
from django.conf import settings
from django.views.generic.simple import redirect_to

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^apirest/', include('apirest.urls')),
    url(r'^$', 'apirest.views.show_system'),
)

if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^coverage/', redirect_to,
            {'url': settings.STATIC_URL + 'coverage/index.html'}),
    )