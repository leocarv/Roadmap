Ext.define('AM.controller.Menu', {
    extend: 'Ext.app.Controller',
    views:  ['menu.Tree'],
    init: function() {
        this.control({
            'viewport menutree' : {
                itemclick: function(view, record) {
                    var storeProduct = Ext.widget('productlist').getStore();
                    storeProduct.clearFilter();
                    layout.down('#panelPrincipal').getLayout().setActiveItem(record.get('tela'));
                }
            }
        });
    }
});