Ext.define('Ext.ux.form.GridField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.gridfield',
    layout: 'fit',
    mixins: {
        field: 'Ext.form.field.Field'
    },

    store: null,
    columns: null,
    title: null,
    
    initComponent: function(){
        //if(!this.store)
        //    throw "The 'store' config is mandatory in GridField";

        if(this.columns == null){
            this.columns = [
                {header: gettext('Nome'), dataIndex: 'name', flex:1}
            ];
        }
        this.addEvents('storeload');

        this.items = {
            xtype: 'grid',
            autoScroll: true,
            itemId: 'grid',
            selType: 'checkboxmodel',
            multiSelect: true,
            store: this.store,
            columns: this.columns,
            title: this.title
        };
    
        this.callParent(arguments);
        this.initField();

        this.grid = this.getComponent('grid');
        // this.grid.on('afterrender', function(view){
            /*
             * possível bug: ao permitir que não seja declarado o store,
             * esse trecho do codigo pode ficar invalido, pois o callback desse load
             * estará configurado para um empty store
             */
            this.grid.getStore().load();

            this.grid.getStore().on('load', function(){
                this.fireEvent('storeload', this.grid);
            },this);
        //}, this);
    },

    
    getSelectedItems: function(){
        return this.grid.getSelectionModel().getSelection();
    },


    getValue: function(){
        var selection = this.getSelectedItems();
        var value = [];
        Ext.each(selection, function(v, index){
           value.push(v.data);
        }, this);
        return value;

    }, 

    setValue: function(value){
        if(!this.grid) return;

        var store = this.grid.getStore();
        this.doAutoRender(); // Isso permite selecionar antes de renderizar
        // if(!store.count()) return;

        var selection = this.grid.getSelectionModel()
            newSelection = []
            record = null;
        Ext.each(value, function(ig){
            if(!ig) return;
            var id = null;
            
            if(Ext.isObject(ig))
                id = ig.id
            else
                id = ig
            
            record = store.getById(id);
            newSelection.push(record);
        }, this);
        selection.select(newSelection);
    }
    
});
