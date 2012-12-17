Ext.define('Ext.ux.form.ListCrudOrderedField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.listcrudorderedfield',
    layout: {
        type:'border'
    },
    mixins: {
        field: 'Ext.form.field.Field'
    },
    //autoScroll: true,
    store: null,
    columns: null,
    _columns: [],
    order_field: null,
    title: null,
    allowAdd: true,
    allowDelete: true,
    allowEdit: true,
    showActionColumn: true,    

    initComponent: function(){
    
        this.setColumns(this.columns, false);

        var actionButtons = [];

        if (this.allowAdd) {
            actionButtons.push({
                                xtype: 'button',
                                iconCls: 'nv-icon-add',
                                itemId: 'btnAdd',
                                handler: this.addItem,
                                tooltip: gettext('Adicionar novo')
                            });
        }

        var defaultButtons = [
            {
                xtype: 'button',
                iconCls: 'nv-icon-up',
                itemId: 'reorderUp',
                handler: this.reorderUp,
                tooltip: gettext('Mover para cima')
            },
            {
                xtype: 'button',
                iconCls: 'nv-icon-down',
                itemId: 'reorderDown',
                handler: this.reorderDown,
                tooltip: gettext('Mover para baixo')
            }
        ];

        actionButtons = actionButtons.concat(defaultButtons);

        var plugins = [];

        if (this.allowAdd || this.allowEdit) {
            plugins =  [
                            Ext.create('Ext.grid.plugin.RowEditing', {
                                clicksToEdit: 2,
                                pluginId: 'editor',
                                errorSummary: true,
                                autoCancel: true,
                                saveText  : gettext("Salvar"),
                                cancelText: gettext("Cancelar")
                            })
                       ]

        }

        this.items = [
            {
                flex: 7,
                region: 'center',
                xtype: 'grid',
                autoScroll: true,
                itemId: 'grid',
                multiSelect: false,
                store: this.store,
                columns: this._columns,
                title: this.title, 
                minHeight: 150,
                plugins: plugins 
            },
            {
                flex: 3,
                region: 'east',
                xtype: 'container',
                height: 100,
                layout: { type: 'vbox', align: 'center', pack: 'center'},
                items: [actionButtons]
            }
        ];
    
        this.callParent(arguments);
    },

    reorderUp: function(cmp){
        var view = cmp.up('listcrudorderedfield');
        var grid = view.down('gridpanel');
        var rec = grid.getSelectionModel().getSelection()[0]
        if (!rec){
           return false;
        }
        var index =0;
        var origIndex = rec.index;
        if(origIndex==0){
            return false;
        }
        var store = grid.getStore();
        store.remove(rec);
        store.insert(origIndex -1,rec);
        store.data.items.forEach( function(r){ 
            r.index = index;
            index++;
        });
        grid.selModel.select(rec);
    },

    reorderDown: function(cmp){
        var view = cmp.up('listcrudorderedfield');
        var grid = view.down('gridpanel');
        var rec = grid.getSelectionModel().getSelection()[0]
        if (!rec){
            return false;
        }
        var index =0;
        var origIndex = rec.index;
        var store = grid.getStore();
        if(origIndex==store.data.lengtht-1){
            return false;
        }
        store.remove(rec);
        store.insert(origIndex +1,rec);
        store.data.items.forEach( function(r){
            r.index = index;
            index++;
        });
        grid.selModel.select(rec);
    },  

    addItem: function(cmp) {
        var view = cmp.up('listcrudorderedfield');
        var grid = view.down('gridpanel');
        var plugin = grid.getPlugin('editor');
        var store = grid.getStore();
        var newObj = {};
        if (!store.fields) {
            return;
        }
        store.fields.forEach( function(key){
            newObj[key] = '';
        })
        newObj.index = store.data.length;
        store.add(newObj);
        
        store.data.items.forEach( function(r){
            if (!r.index) {
                r.index = store.data.length - 1;
            }
        });
        
        plugin.startEdit((store.data.length-1), 1);
    },
    
    getValue: function(){
        var grid = this.down('gridpanel');
        var rtn_arr = [];
        if (!grid) return [];
        grid.getStore().data.items.forEach( function(item) {
            rtn_arr.push({id:item.data.id, name:item.data.name});
        });
        return rtn_arr;
    }, 

    getStore: function() {
        var grid = this.down('gridpanel');
        return grid.getStore();
    },

    setValue: function(values){
        var grid = this.down('gridpanel');
        var store = grid.getStore();
        if (values) {
            for (var i=0; i < values.length; i++) {
                store.add(values[i]);
            }
        }

        var index = 0;
        store.each( function(r){
            r.index = index;
            index++;
        });

    },
    
    itemsAction: function(){
        var deleteAction, editAction, actionsButtons=[];
        deleteAction = {
            iconCls: 'nv-icon-delete',
            icon: '/static/resources/images/icons/famfam/delete.png', // TODO: remove
            width: 10,
            height: 10,
            itemId: 'deleteAction',
            handler: function(grid, rowIndex, colIndex) {
                var store = grid.getStore();
                store.removeAt(rowIndex);
            },
            tooltip: gettext('Apagar campo')
        }
        editAction = {
            iconCls: 'nv-icon-edit',
            icon: '/static/resources/images/icons/famfam/application_edit.png', // TODO: remove
            width: 10,
            height: 10,
            itemId: 'editAction',
            handler: function(view, rowIndex) {
                var grid = view.up('gridpanel');
                var plugin = grid.getPlugin('editor');
                plugin.startEdit(rowIndex, 1);
            },
            tooltip: gettext('Editar campo')
        }
    
        if ( this.allowEdit ){ actionsButtons.push(editAction); }
        if ( this.allowDelete ){ actionsButtons.push(deleteAction); }

     return actionsButtons
    },

    setColumns: function(columns, reconfigure){
    
        var actionColumn =   {
            xtype: 'actioncolumn',
            width: 40,
            items: this.itemsAction(),
            header: ''
        };

        this._columns = [];
        if (this.showActionColumn) this._columns.push(actionColumn);
        if(columns == null){
            this._columns.push({header: gettext('Nome'), dataIndex: 'name', sortable: false, flex:1, editor: {xtype: 'textfield', allowBlank: false}});
        } else {
            columns.forEach( function(column){
                if(!column.editor){
                    column.editor = {xtype: 'textfield', allowBlank: false};
                }
                if(!column.dataIndex){
                    throw "The 'dataIndex' definition of column is obrigatory";
                }
                column.sortable = false;
                this._columns.push(column);
            }, this)
        }
        if (reconfigure) {
            this.down('gridpanel').reconfigure(null, this._columns);
        }
    },
    
    setStore: function(store){
        if(!store) {
            throw "The 'store' config is mandatory in ListCrudOrderedField";
        }
        this.store = store;
        this.down('gridpanel').reconfigure(store);
    }
});
