Ext.define('AM.controller.ProductSpec', {
    extend: 'Ext.app.Controller',
        
    stores: [
        'ProductSpecs'],
            
    models: [
        'ProductSpec'],
    
    views: [
        'productspec.List', 
        'productspec.NewEdit'],
            


    init: function() {
        this.control({
            '#specList button#btnNovoProductSpec' : {
                click: this.newProductSpec
            },
            'productspeclist': {
                editarProductSpec: this.editProductSpec,
                deleteProductSpec: this.deleteProductSpec,
                itemdblclick: this.dblClickProcuctSpec
            },
            'productspecnewedit button#btnSaveProductSpec': {
                click: this.saveProductSpec
            },
            'productspecnewedit button#btnAddFeature': {
                click: this.addFeature
            },
            'productspecnewedit': {
                afterrender: this.initialize
            }
        });
    },
    

    newProductSpec: function(button) {
        var view = Ext.widget('productspecnewedit', {title: 'Novo ProductSpec'});
    },
    
    editProductSpec: function(record) {
        var view = Ext.widget('productspecnewedit', {title: 'Editar ' + record.get('name')});
        var pSpecId = record.get('id');
        var productSpec = Ext.ModelMgr.getModel('AM.model.ProductSpec');
        productSpec.load(pSpecId, {
            success: function(productSpec) {
                view.down('form').loadRecord(productSpec);
            }
        });
    },

    deleteProductSpec: function(record) {
        Ext.MessageBox.confirm('Confirm', 'Confirma a exclusão do registro "' + record.get('name') + '"?', 
                               function(result) { 
                                    if (result == 'yes') {
                                        this.getProductSpecsStore().remove(record);
                                        this.getProductSpecsStore().sync();
                                    }
                               }, this
        );
    },
    
    dblClickProcuctSpec: function(grid, record, item, index, e, eOpts) {
        var store = grid.getStore();
        var rec = store.getAt(index);
        /*--- filtrar os products ---*/
        var idProdSpec = rec.data.id;
        var listaProdutos = Ext.widget('productlist');
        var storeProduct = listaProdutos.getStore();
        storeProduct.filter("id", idProdSpec);
        /*--- ******************* ---*/
        layout.down('#panelPrincipal').getLayout().setActiveItem('prodList');
    },

    saveProductSpec: function(button) {
        var win    = button.up('window'),
            form   = win.down('form'),
            record = form.getRecord(),
            values = form.getValues(),
            lista  = form.down('sl-smartlist');
            
        if (!form.getForm().isValid()) {
            Ext.MessageBox.alert('Road Map', 'Preencha corretamente o formulário.');
            return false;
        }

        var psStore = this.getProductSpecsStore();

        if (record==undefined) {
            psStore.add(
                Ext.create('AM.model.ProductSpec', {
                    name: values.name,
                    feature_set: lista.getValue()
                })
            );
        } else {
            values.feature_set = lista.getValue()
            record.set(values);
            record.save();
        }
        
        win.close();
        psStore.sync();
    },


    initialize: function(view){
        view.featureList.component = this.getFeatureListComponent();
    },
    
    addFeature: function(button) {
        var view = button.up('productspecnewedit');
        view.featureList.add({id: null, name:'', description:''});
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
                    xtype: 'textfield',
                    name: 'name',
                    fieldLabel: 'Nome',
                    flex: 0.8,
                    allowBlank: false,
                    margin: '0 10 0 0'
                },
                {
                    xtype: 'textfield',
                    name: 'description',
                    fieldLabel: 'Descrição',
                    flex: 0.2,
                    margin: '0 10 0 0'
                }

            ],

            setValue: function(data){
                this.down('hiddenfield[name=id]').setValue(data.id);
                this.down('textfield[name=name]').setValue(data.name);
                this.down('textfield[name=description]').setValue(data.description);
            },

            getValue: function(){
                var rtn_data = {
                    id: this.down('hiddenfield[name=id]').getValue() || null,
                    name: this.down('textfield[name=name]').getValue(),
                    description: this.down('textfield[name=description]').getValue()
                }
                if(rtn_data.id) {
                    rtn_data.id = parseInt(rtn_data.id, 10);
                }
                return rtn_data;
            },

            isValid: function() {
                return this.down('textfield[name=name]').isValid();
            }
        }; 
        return component;
    }

});