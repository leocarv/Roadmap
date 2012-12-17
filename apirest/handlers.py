#!python
from rest.handler import BaseHandler
from rest.utils import rc
from apirest.models import ProductSpec, Feature, Product, FeatureValue
from django.db import transaction


class ProductSpecHandler(BaseHandler):
    allowed_methods = ('GET', 'POST', 'PUT', 'DELETE')
    model = ProductSpec
    list_fields = ('id', 'name')
    fields = ('id', 'name', ('feature_set', ('id', 'name', 'description')))

    @transaction.commit_manually
    def create(self, request, *args, **kwargs):
        data = request.POST     # recupera os dados
        ps = ProductSpec.objects.create(
                                name=data.get('name'))  # salva productspec
        if 'feature_set' in data:  # se receber feature_set
            for feature in data['feature_set']:  # salva os itens de features
                Feature.objects.create(product_spec=ps,
                                       name=feature['name'],
                                       description=feature['description'])
        transaction.commit()
        return ps

    def read(self, request, **kwargs):
        try:
            if 'id' in kwargs:  # se receber o parametro id recupera o registro
                ps = ProductSpec.objects.get(pk=kwargs['id'])
            else:  # senao recupera todos registros
                ps = ProductSpec.objects.all()
        except ProductSpec.DoesNotExist:
            return rc.NOT_FOUND
        return ps

    @transaction.commit_manually
    def update(self, request, id):
        try:
            ps = ProductSpec.objects.get(pk=id)
        except ProductSpec.DoesNotExist:
            return rc.NOT_FOUND

        data = request.PUT             # recupera os dados
        ps.name = data['name']  # atualiza o nome do spec
        ps.save()

        # apaga todas features
        Feature.objects.filter(product_spec__exact=ps.id).delete()
        if 'feature_set' in data:
            for feature in data['feature_set']:   # salva os features
                Feature.objects.create(product_spec=ps,
                                    name=feature['name'],
                                    description=feature['description'])
        transaction.commit()
        return ps

    def delete(self, request, id):
        try:
            ps = ProductSpec.objects.get(pk=id)  # tenta recuperar productSpec
            ps.delete()  # e apagar de acordo com o ID passado
        except ProductSpec.DoesNotExist:
            return rc.NOT_FOUND
        return rc.DELETED  # returns HTTP 204


class ProductHandler(BaseHandler):
    allowed_methods = ('GET', 'POST', 'PUT', 'DELETE')
    model = Product
    list_fields = ('id', 'name', 'price')
    fields = ('id', 'name', 'price',
        ('product_spec', ('id', 'name')),
        ('featurevalue_set', ('id', 'value',
            ('feature', ('name', 'id'))))
        )

    @transaction.commit_manually
    def create(self, request):
        data = request.POST  # recupera os dados
        try:  # recupera o productSpec
            ps = ProductSpec.objects.get(pk=data['product_spec']['id'])
        except ProductSpec.DoesNotExist:
            return rc.NOT_FOUND

        pr = Product.objects.create(product_spec=ps,  # insere o Product
                                    name=data['name'],
                                    price=data['price'])

        if 'featurevalue_set' in data:  # se receber featurevalue_set
            for featurevalue in data['featurevalue_set']:  # salva os itens
                try:
                    #recupera o Feature
                    ft = Feature.objects.get(pk=featurevalue['feature']['id'])
                except Feature.DoesNotExist:
                    transaction.rollback()
                    return rc.NOT_FOUND
                FeatureValue.objects.create(product=pr,  # salva o Value
                                            feature=ft,
                                            value=featurevalue['value'])
        transaction.commit()
        return pr

    def read(self, request, **kwargs):
        try:
            if 'id' in kwargs:  # se receber o parametro id recupera o registro
                pr = Product.objects.get(pk=kwargs['id'])
            else:  # senao recupera todos registros
                pr = Product.objects.all()
        except Product.DoesNotExist:
            return rc.NOT_FOUND
        return pr

    @transaction.commit_manually
    def update(self, request, id):
        data = request.PUT    # recupera os dados
        try:
            #recupera o Produce e productSpec
            pr = Product.objects.get(pk=id)
            ps = ProductSpec.objects.get(pk=data['product_spec']['id'])
        except Product.DoesNotExist:
            return rc.NOT_FOUND
        except ProductSpec.DoesNotExist:
            return rc.NOT_FOUND

        pr.product_spec = ps
        pr.name = data['name']
        pr.price = data['price']
        pr.save()

        #apaga todas features values
        FeatureValue.objects.filter(product__exact=pr.id).delete()
        if 'featurevalue_set' in data:  # se receber feature_set
            # salva os itens de feature values
            for featurevalue in data['featurevalue_set']:
                try:
                    #recupera o Feature
                    ft = Feature.objects.get(pk=featurevalue['feature']['id'])
                except Feature.DoesNotExist:
                    transaction.rollback()
                    return rc.NOT_FOUND
                FeatureValue.objects.create(product=pr,
                                            feature=ft,
                                            value=featurevalue['value'])
        transaction.commit()
        return pr

    def delete(self, request, id):
        try:
            ps = Product.objects.get(pk=id)
            ps.delete()
        except Product.DoesNotExist:
            return rc.NOT_FOUND
        else:
            return rc.DELETED  # returns HTTP 204
