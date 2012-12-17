# encoding: utf-8
from django.http import HttpResponse, \
                        HttpResponseBadRequest, \
                        HttpResponseNotAllowed
from django.utils.translation import gettext as _


def download_csv(request):
    if request.method not in ('GET', 'POST'):
        return HttpResponseNotAllowed(
            _('Esta funcionalidade aceita apenas GET e POST'))

    data = request.__getattribute__(request.method)

    if not data:
        return HttpResponseBadRequest(
            _('Os parâmetros enviados estão incorretos'))

    content = data.get('content')
    filename = data.get('filename')

    if not content or not filename:
        return HttpResponseBadRequest(
            _('Os parâmetros enviados estão incorretos'))

    response = HttpResponse(data, content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = 'attachment; filename="%s.csv"' % \
                                                filename
    response.content = content.encode('latin1')
    return response
