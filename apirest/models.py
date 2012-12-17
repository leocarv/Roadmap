from django.db import models


class ProductSpec(models.Model):
    name = models.CharField(max_length=100)

    def __unicode__(self):
        return self.name


class Feature(models.Model):
    product_spec = models.ForeignKey(ProductSpec)
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __unicode__(self):
        return self.name


class Product(models.Model):
    product_spec = models.ForeignKey(ProductSpec)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __unicode__(self):
        return self.name


class FeatureValue(models.Model):
    product = models.ForeignKey(Product)
    feature = models.ForeignKey(Feature)
    value = models.CharField(max_length=100)

    def __unicode__(self):
        return self.value
