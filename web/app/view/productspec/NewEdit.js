Ext.define('AM.view.productspec.NewEdit', {
    extend: 'Ext.window.Window',
    requires: ['Ext.ux.list.SmartList'],
    alias: 'widget.productspecnewedit',
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
                        xtype: 'textfield',
                        fieldLabel: 'Nome',
                        name: 'name',
                        width: 550,
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
                                xtype: 'button',
                                itemId: 'btnAddFeature',
                                text: null,
                                margin: '10 0 10 10',
                                iconCls: 'nv-icon-add',
                                tooltip: 'Adiciona nova feature'
                            },
                            {
                                xtype: 'sl-smartlist',
                                name: 'feature_set',
                                component: null,
                                ordering: false,
                                height:200,
                                lineHeight: 55,
                                buttonConfig: {
                                    remove: {
                                        text: null,
                                        flex: null,
                                        iconCls: 'nv-icon-delete',
                                        tooltip: 'Remover feature'
                                    }
                                },
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
                itemId: 'btnSaveProductSpec'
            },
            {
                text: 'Cancelar',
                scope: this,
                handler: this.close
            }
        ]; 

        this.callParent(arguments);
        this.featureList = this.down("sl-smartlist[name=feature_set]");
        this.editForm = this.down('[itemId=editForm]');        
    }
});