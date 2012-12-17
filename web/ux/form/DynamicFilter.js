Ext.define('Ext.ux.form.DynamicFilter', {
    extend: 'Ext.container.Container',
    alias: 'widget.dynamicfilter',
    mixins: {
        field: 'Ext.form.field.Field'
    },
    requires: 'Ext.ux.form.UXFilterItem',
    defaults: {
        margin: '0 0 5 0'
    },
    items: [
        {
            xtype: 'button',
            iconCls: 'nv-icon-add',
            text: 'Adicionar',
            itemId: 'btnAdd',
            handler: function(obj, event){
                var cmp = obj.up('dynamicfilter');
                cmp.addFilter(cmp);
            },
            tooltip: gettext('Adicionar filtro')
        },
        {
            itemId: 'itemsfilter',
            xtype: 'form',
            layout: {
                type:'hbox'
            },
            items:[ 
                {
                    xtype: 'label',
                    text: gettext('Chave'),
                    margins: '0 120 0 30'
                },
                {
                   xtype: 'label',
                    text: gettext('Operador'),
                    margins: '0 105 0 10'
                },
                {
                    xtype: 'label',
                    text: gettext('Valor'),
                    margins: '0 0 0 10'
                }
            ]
        },
        {
            itemId: 'fieldsForm',
            xtype: 'container',
            defaults: {
                isFormField: false
            },
            autoScroll: true,
            minHeight: 90
        }
    ],

    initComponent: function(){
        this.callParent(arguments);
        this.fieldsForm = this.down('[itemId=fieldsForm]');
    },
    
    addFilter: function(view, values) {
        if(!values) values = {pattern:'', operator:'', value: '' };

        var fieldsForm = view.down('[itemId=fieldsForm]');

        var newObj = Ext.create('Ext.ux.form.UXFilterItem',{value:values, isFormField: false});
        fieldsForm.insert(1, newObj);
        newObj.down('#pattern').focus();
    },

    getValue: function(){
        var values = [],
            filters = this.query('uxfilteritem');

        Ext.each(filters, function(fil){
            if(fil.isValid()) values.push(fil.getValue());
        });

        return values;
    },

    setValue: function(dataList){
        this.reset();
        if (!dataList){
            dataList = [];
        }
        Ext.Array.forEach(dataList, function(fil){
            this.addFilter(this, fil);
        }, this);
    },
    
    reset: function(){
        this.fieldsForm.removeAll();
    },

    isValid: function(){
        var isValid = true;
            fields = this.down('uxfilteritem');
        Ext.each(fields, function(fil){
            if(!fil.isValid()) isValid =  false;
        });

        return isValid;
    },
    
    isEmpty: function(){
        return this.getValue() > 0;
    }
});
