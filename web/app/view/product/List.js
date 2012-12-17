Ext.define('AM.view.product.List' ,{
    extend: 'Ext.grid.Panel',
    alias: 'widget.productlist',
    store: 'Products',
    width: 400,
    margin: '2 4 2 4',
    layout:'column',
    initComponent: function() {
        this.columns = [
            {header: 'Id', dataIndex: 'id', flex: 0.15},
            {header: 'Name',  dataIndex: 'name',  flex: 0.65},
            {header: 'Price',  dataIndex: 'price',  flex: 0.20},
            {
                xtype:'actioncolumn',
                width:40,
                items: [{
                    icon: '/static/resources/images/buttons/edit.png',  // Use a URL in the icon config
                    tooltip: 'Edit',
                    handler: function(grid, rowIndex, colIndex) {
                        var store = grid.getStore();
                        var rec = store.getAt(rowIndex);                        
                        this.up('productlist').fireEvent('editarProduct', rec);
                    }
                },{
                    icon: '/static/resources/images/buttons/delete.png',
                    tooltip: 'Delete',
                    handler: function(grid, rowIndex, colIndex) {
                        var store = grid.getStore();
                        var rec = store.getAt(rowIndex);
                        this.up('productlist').fireEvent('deleteProduct', rec);                
                    }
                }]
            }
        ];
        this.callParent(arguments);
    }
});