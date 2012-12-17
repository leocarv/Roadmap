from rest.utils import rc


class permissions_required(object):
    permissions = None

    def __init__(self, permissions=None):
        self.permissions = permissions
        self.methods = {'read': 'GET',
                        'create': 'POST',
                        'update': 'PUT',
                        'delete': 'DELETE'
                       }

    def __call__(self, f):

        def wrapped_f(caller, request, *args, **kwargs):
            try:
                method = self.methods.get(f.func_name, None)
                permissions = caller.permissions.get(method, None)
                if permissions and self.permissions:
                    raise ValueError('Permissions must be defined' +
                        ' on the handler attribute OR on the decorator')
            except AttributeError, e:
                permissions = self.permissions
            except ValueError, e:
                raise e
            if permissions:
                if not isinstance(permissions, list):
                    permissions = [permissions]
                user = request.user
                if not (user.has_perms(permissions)):
                    return rc.FORBIDDEN
            return f(caller, request, *args, **kwargs)
        return wrapped_f
