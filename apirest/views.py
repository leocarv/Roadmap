# coding=utf-8
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.shortcuts import render_to_response
import django.conf
from django.utils.translation import gettext as _
from django.contrib.auth.models import Permission
from django.views.decorators.csrf import csrf_exempt

@login_required
def show_system(request):
    try:
        js_debug = django.conf.settings.JS_DEBUG
    except:
        js_debug = False
    return render_to_response('apirest/index.html', {'js_debug': js_debug})
    
@csrf_exempt
def do_login(request):
    if request.method == 'GET':
        error_msg = request.GET.get('error_msg', '')
        return render_to_response('apirest/login.html',
                            {'error_msg': error_msg})

    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)

    if user is not None:
        login(request, user)
        return HttpResponseRedirect('/')
        
    return render_to_response('apirest/login.html',
                    {'error_msg': _(u'Usuário ou senha inválido'),})


def do_logout(request):
    logout(request)
    return HttpResponseRedirect('/')