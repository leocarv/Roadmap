Ext.define('AM.view.product.NewEdit', {
    extend: 'Ext.window.Window',
    requires: ['Ext.ux.list.SmartList'],
    alias: 'widget.productnewedit',
    layout: 'fit',
    autoShow: true,
    width: 580,
    initComponent: function() {

        this.items = [
            {
                xtype: 'form',
                itemId: 'editForm',
                items: [
                    {
                        xtype: 'combobox',
                        fieldLabel: 'Product Spec',
                        name: 'product_spec',
                        store: 'ProductSpecs',
                        valueField: 'id',
                        displayField: 'name',
                        editable: false,
                        width: 550
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Nome',
                        name: 'name',
                        width: 550,
                        allowBlank: false
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Preço',
                        name: 'price',
                        maskRe: /[0-9]+/,
                        width: 200,
                        allowBlank: false
                    },
                    {
                        xtype: 'fieldset',
                        name: 'featureListSet',
                        title: 'Features',
                        disable: false,
                        collapsible: true,
                        width: 565,
                        items: [
                            {
                                xtype: 'sl-smartlist',
                                name: 'featurevalue_set',
                                component: null,
                                ordering: false,
                                height:300,
                                lineHeight: 30,
                                removal: false,
                                reset: function() {
                                }
                            }
                        ]                    
                    }     
                ]
            }
        ];

        this.buttons = [
            {
                text: 'Salvar',
                itemId: 'btnSaveProduct'
            },
            {
                text: 'Cancelar',
                scope: this,
                handler: this.close
            }
        ]; 

        this.callParent(arguments);
        this.featureValueList = this.down("sl-smartlist[name=featurevalue_set]");
        this.editForm = this.down('[itemId=editForm]');        
    }
});