# coding: utf-8
from piston.utils import rc_factory
import re


class RcFactoryPtBr(rc_factory):
    """
    Status codes.
    """
    CODES = dict(ALL_OK=('OK', 200),
                 CREATED=('Criado', 201),
                 DELETED=('', 204),  # 204 says "Don't send a body!"
                 BAD_REQUEST=('Requisição Falha', 400),
                 FORBIDDEN=('Acesso Negado', 401),
                 NOT_FOUND=('Não Encontrado', 404),
                 DUPLICATE_ENTRY=('Conflito/Duplicado', 409),
                 NOT_HERE=('Perdido', 410),
                 INTERNAL_ERROR=('Erro interno do servidor', 500),
                 NOT_IMPLEMENTED=('Não implementado', 501),
                 THROTTLED=('Serviço Indisponível', 503))

rc = RcFactoryPtBr()


class XFormatUnicode(unicode):
    """
    Unicode subclass, suitable for using with formatting strings.

    This subclass allows you to use regex as formatting parameter,
    like this:
        got = XFormatUnicode('source=SPO-TP001-SDH001 location=sao paulo')
        tpl = 'Got value: {value:re("^source=(.*)\s*location=(.*)$", 1)}'
        tpl.format(value=got) # returns 'sao paulo'

    It is possible to use a default error message, when formatting fails:
        got = XFormatUnicode(str, format_error_msg='{original_value}')
    You can use, as format_error_msg, the 3 variables above:
        - error_cls: The exception class raised
        - error_msg: The exception description
        - original_value: The original value used, before formatting error
    """

    # How to match for a format like:
    #   re(my_format, group_index)
    _format_regex = re.compile('re\(\"(.*)\"\s*\,\s*(.*)\)$')

    def __new__(cls, string, format_error_msg=None, *args, **kwargs):
        inst = unicode.__new__(cls, string, *args, **kwargs)
        inst._format_error_msg = format_error_msg
        return inst

    def _do_formatting(self, pattern, index):
        ret = re.findall(pattern, self)
        return ''.join(i[index] for i in ret)

    def __format__(self, format_spec):
        try:
            match = self._format_regex.match(format_spec)
            if not match:
                return unicode.__format__(self, format_spec)

            pattern, index = match.groups()

            return self._do_formatting(pattern, int(index))
        except Exception, e:
            if self._format_error_msg:
                return self._format_error_msg.format(error_cls=e.__class__,
                                                    error_msg=e,
                                                    original_value=self)
            return self
