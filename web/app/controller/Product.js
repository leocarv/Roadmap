Ext.define('AM.controller.Product', {
    extend: 'Ext.app.Controller',

    stores: [
        'Products'],

    models: [
        'Product'],

    views:  [
        'product.List', 
        'product.NewEdit'],



    init: function() {
        this.control({
            '#prodList button#btnNovoProduct' : {
                click: this.newProduct
            },
            'productlist': {
                editarProduct: this.editProduct,
                deleteProduct: this.deleteProduct
            },
            'productnewedit button#btnSaveProduct': {
                click: this.saveProduct
            },
            'productnewedit': {
                afterrender: this.initialize
            },
            'productnewedit combobox[name=product_spec]': {
                select: this.selectProdSpec
            }
        });
    },
    


    newProduct: function(button) {
        var view = Ext.widget('productnewedit', {title: 'Novo Product'});
    },
    
    editProduct: function(record) {
        var view = Ext.widget('productnewedit', {title: 'Editar ' + record.get('name')});
        var prodId = record.get('id');
        var product = Ext.ModelMgr.getModel('AM.model.Product');
        product.load(prodId, {
            success: function(prod) {
                prod.data.product_spec = prod.data.product_spec.id;
                view.down('form').loadRecord(prod);
            }
        });
    },

    deleteProduct: function(record) {
        Ext.MessageBox.confirm('Confirm', 'Confirma a exclusão do registro "' + record.get('name') + '"?', 
                               function(result) { 
                                    if (result == 'yes') {
                                        this.getProductsStore().remove(record);
                                        this.getProductsStore().sync();
                                    }
                               }, this
        );
    },

    saveProduct: function(button) {

        var win    = button.up('window'),
            form   = win.down('form'),
            record = form.getRecord(),
            values = form.getValues(),
            lista  = form.down('sl-smartlist');

            
        if (!form.getForm().isValid()) {
            Ext.MessageBox.alert('Road Map', 'Preencha corretamente o formulário.');
            return false;
        }

        var productStore = this.getProductsStore();

        if (record==undefined) {
            productStore.add(
                Ext.create('AM.model.Product', {
                    name: values.name,
                    price: values.price,
                    product_spec: {id: values.product_spec},
                    featurevalue_set: lista.getValue()
                })
            );
        } else {
            values.product_spec = {id: values.product_spec};
            values.featurevalue_set = lista.getValue();
            record.set(values);
            record.save();
        }
        
        win.close();
        productStore.sync();
    },


    selectProdSpec: function(combo, records, eOpts) {

        var win    = combo.up('window'),
            form   = win.down('form'),
            lista  = form.down('sl-smartlist');

        var pSpecId = records[0].data.id;
        var productSpec = Ext.ModelMgr.getModel('AM.model.ProductSpec');
        productSpec.load(pSpecId, {
            success: function(productSpec) {
                var rtn_data = [];
                Ext.each(productSpec.data.feature_set, function(item){ 
                    rtn_data.push({
                        id: 0,
                        value: '',
                        feature: {id: item.id, name: item.name}
                    });
                });
                lista.setValue(rtn_data);
            }
        });
    },

    initialize: function(view){
        view.featureValueList.component = this.getFeatureListComponent();
    },

    getFeatureListComponent: function(){
        var component = {
            xtype: 'container',
            layout: 'vbox',
            defaults: {
                submitValue: false,
                isFormField: false
            },
            items: [
                {
                    xtype: 'hiddenfield',
                    allowBlank: true,
                    name: 'id'
                },
                {
                    xtype: 'hiddenfield',
                    allowBlank: true,
                    name: 'idFeature'
                },
                {
                    xtype: 'textfield',
                    name: 'value',
                    fieldLabel: 'Nome',
                    flex: 0.2,
                    allowBlank: false,
                    margin: '0 10 0 0'
                }

            ],

            setValue: function(data){
                this.down('hiddenfield[name=idFeature]').setValue(data.feature.id);
                this.down('hiddenfield[name=id]').setValue(data.id);
                this.down('textfield[name=value]').setFieldLabel(data.feature.name);
                this.down('textfield[name=value]').setValue(data.value);                
            },

            getValue: function(){
                var rtn_data = {
                    id: this.down('hiddenfield[name=id]').getValue(),
                    feature: {
                        id: this.down('hiddenfield[name=idFeature]').getValue()
                    },
                    value: this.down('textfield[name=value]').getValue()
                }
                if(rtn_data.id) {
                    rtn_data.id = parseInt(rtn_data.id, 10);
                }
                return rtn_data;
            },

            isValid: function() {
                return this.down('textfield[name=value]').isValid();
            }
        }; 
        return component;
    }

});