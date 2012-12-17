Ext.Loader.setConfig({
   enabled: true
});

Ext.Loader.setPath('Ext.ux', '/static/ux');
Ext.Loader.setPath('Ext.ux.plugin.FancyScroll', '/static/ux/plugin/FancyScroll/FancyScroll.js');
Ext.Loader.setPath('Ext.ux.plugin.minimize', '/static/ux/plugin/ExtJS-Minimize/');
Ext.Loader.setPath('Ext.ux.list', '/static/ux/extjs-smartlist/');

Ext.application({
    requires: ['Ext.container.Viewport'],
    name: 'AM',
    appFolder: '/static/app',

    controllers: ['Menu', 
                  'ProductSpec', 
                  'Product'],

    launch: function() {
        layout = Ext.create('Ext.container.Viewport', {
            layout: 'border',
            items: [
                        {
                            region: 'north',
                            border: false,
                            html: '<div style="background-color:#DFE8F6; color:#336699; height:50px;"><h1 style="font-size:28px;">> ROADMAP</h1><h3 style="float:right;margin-right:30px"><a href="/apirest/logout">> Sair</a></h3></div>',
                            margins: '20 0 5 20'
                        },
                        {
                            region: 'west',
                            collapsible: true,
                            title: 'Navegação',
                            items: [{xtype: 'menutree'}]
                        },                        
                        {
                            layout: 'card',
                            itemId: 'panelPrincipal',
                            region: 'center',
                            xtype: 'panel',
                            items: [
                                    {
                                    xtype: 'panel', 
                                    itemId: 'specList',
                                    title: 'ProductSpecs',
                                        items: [
                                                {
                                                    xtype: 'button',
                                                    itemId: 'btnNovoProductSpec',
                                                    text: 'Novo Product Spec',
                                                    margin: '5 4 2 4'
                                                },
                                                {xtype: 'productspeclist'}
                                            ]
                                    },
                                    {
                                    xtype: 'panel', 
                                    itemId: 'prodList',
                                    title: 'Products',
                                        items: [
                                                {
                                                    xtype: 'button',
                                                    itemId: 'btnNovoProduct',
                                                    text: 'Novo Product',
                                                    margin: '5 4 2 4'
                                                },
                                                {xtype: 'productlist'}
                                            ]
                                    }
                            ]
                        }
                    ]
        });
    }
});