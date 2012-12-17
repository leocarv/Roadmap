Ext.define('AM.model.Product', {
    extend: 'Ext.data.Model',
    fields: ['id', 'name', 'price', 'product_spec', 'featurevalue_set'],
    proxy: {
        type: 'rest',
        url : '/apirest/product/'
    }
});