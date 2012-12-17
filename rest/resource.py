from piston.resource import Resource, CHALLENGE
from django.conf import settings
from piston.utils import rc, format_error, translate_mime, MimerDataException
from piston.emitters import Emitter
from django.http import HttpResponse, HttpResponseNotAllowed
from piston.handler import typemapper
from piston.utils import coerce_put_post, FormValidationError, HttpStatusCode
from django.views.decorators.vary import vary_on_headers
from django.db.models.query import QuerySet
import json


class ExtResource(Resource):
    @vary_on_headers('Authorization')
    def __call__(self, request, *args, **kwargs):
        """
        NB: Sends a `Vary` header so we don't cache requests
        that are different (OAuth stuff in `Authorization` header.)
        """
        rm = request.method.upper()

        # Django's internal mechanism doesn't pick up
        # PUT request, so we trick it a little here.
        if rm == "PUT":
            coerce_put_post(request)

        actor, anonymous = self.authenticate(request, rm)

        if anonymous is CHALLENGE:
            return actor(request)
        else:
            handler = actor

        # Translate nested datastructs into `request.data` here.
        if rm in ('POST', 'PUT'):
            try:
                translate_mime(request)
            except MimerDataException:
                return rc.BAD_REQUEST
            if not hasattr(request, 'data'):
                if rm == 'POST':
                    request.data = request.POST
                else:
                    request.data = request.PUT
            """
            Updates the given request object to include data
            send from client in the http body.
            """
            content = request.read()
            data = {}
            if content:
                data = json.loads(content)
            destination = getattr(request, request.method)
            destination = destination.copy()
            destination.update(data)
            setattr(request, request.method, destination)

        if not rm in handler.allowed_methods:
            return HttpResponseNotAllowed(handler.allowed_methods)

        meth = getattr(handler, self.callmap.get(rm, ''), None)
        if not meth:
            raise Http404

        # Support emitter both through (?P<emitter_format>)
        # and ?format=emitter.
        em_format = self.determine_emitter(request, *args, **kwargs)

        kwargs.pop('emitter_format', None)

        # Clean up the request object a bit, since we might
        # very well have `oauth_`-headers in there, and we
        # don't want to pass these along to the handler.
        request = self.cleanup_request(request)

        try:
            result = meth(request, *args, **kwargs)
        except Exception, e:
            result = self.error_handler(e, request, meth, em_format)

        try:
            emitter, ct = Emitter.get(em_format)
            fields = handler.fields

            result_data = result
            if isinstance(result_data, dict) and 'result' in result:
                result_data = result_data['result']

            if hasattr(handler, 'list_fields') \
            and isinstance(result_data, (list, tuple, QuerySet)):
                fields = handler.list_fields
        except ValueError:
            result = rc.BAD_REQUEST
            result.content = "Invalid output format specified '%s'." \
                % em_format
            return result

        status_code = 200

        # If we're looking at a response object which contains non-string
        # content, then assume we should use the emitter to format that
        # content
        if isinstance(result, HttpResponse) and not result._is_string:
            status_code = result.status_code
            # Note: We can't use result.content here because
            # that method attempts
            # to convert the content into a string which we don't want.
            # when _is_string is False _container is the raw data
            result = result._container

        srl = emitter(result, typemapper, handler, fields, anonymous)

        try:
            """
            Decide whether or not we want a generator here,
            or we just want to buffer up the entire result
            before sending it to the client. Won't matter for
            smaller datasets, but larger will have an impact.
            """
            if self.stream:
                stream = srl.stream_render(request)
            else:
                stream = srl.render(request)

            if not isinstance(stream, HttpResponse):
                resp = HttpResponse(stream, mimetype=ct, status=status_code)
            else:
                resp = stream

            resp.streaming = self.stream

            return resp
        except HttpStatusCode, e:
            return e.response
