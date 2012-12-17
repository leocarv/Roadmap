Ext.define('AM.model.ProductSpec', {
    extend: 'Ext.data.Model',
    fields: ['id', 'name', 'feature_set'],
    proxy: {
        type: 'rest',
        url : '/apirest/productspec/'
    }
});