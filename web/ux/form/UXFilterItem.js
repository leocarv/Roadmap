Ext.define('Ext.ux.form.UXFilterItem', {
    extend: 'Ext.form.Panel',
    alias: 'widget.uxfilteritem',
    layout: 'hbox',
    scope:this,
    value: null,
    mixins: {
        field: 'Ext.form.field.Field'
    },
    
    items: [
        {
            xtype: 'button',
            iconCls: 'nv-icon-delete',
            text: '',
            scope: this,
            itemId: 'btnDel',
            handler: function(btn){
                var self = btn.up();
                self.deleteSelf(self);
            },
            tooltip: gettext('Remover Filtro')
        },
        {
            xtype: 'textareafield',
            itemId: 'pattern',
            name: 'pattern',
            allowBlank: false,
            margins: '0 0 0 10',
            isFormField: false,
            height: 30
        },
        {
            xtype: 'combobox',
            itemId: 'operator',
            name: 'operator',
            store: 'admin.Operator',
            displayField: 'name',
            queryMode: 'local',
            valueField: 'id',
            allowBlank: false,
            editable: false,
            margins: '0 0 0 10',
            width: 105,
            isFormField: false
        },
        {
            xtype: 'textareafield',
            itemId: 'value',
            name: 'value',
            margins: '0 0 0 10',
            isFormField: false,
            height: 30
        }
    ],

    initComponent: function(){
         this.on('afterrender', function(){
            this.setFieldsReferences();
            Ext.create('Ext.resizer.Resizer', {
                target: this.down('#pattern'),
                handles: 's',
                pinned: true
            });
            Ext.create('Ext.resizer.Resizer', {
                target: this.down('#value'),
                handles: 's',
                pinned: true
            });
        }, this);

        this.callParent(arguments);
        this.initField();
    },
    
    getValue: function(){
        var vpattern= this.fieldPattern.getValue();
        var voperator = this.feldOperator.getValue();
        var vvalue= this.fieldValue.getValue();
        
        var fil = {'pattern':vpattern, 'operator': voperator, 'value': vvalue };
        
        return fil
    },
    
    isValid: function(){
        var vpattern= this.fieldPattern.isValid();
        var voperator = this.feldOperator.isValid();
        
        var isValid = true;
        if(!vpattern|| !voperator) isValid = false;
  
        return isValid;
    },
    
    setValue: function(obj){
        if(!this.fieldPattern) return undefined;
        this.fieldPattern.setValue(obj['pattern']);
        this.feldOperator.select(obj['operator']);
        this.fieldValue.setValue(obj['value']);
    },
    
    setFieldsReferences: function(){
        this.fieldPattern= this.down('[itemId=pattern]');
        this.feldOperator = this.down('[itemId=operator]');
        this.fieldValue = this.down('[itemId=value]');

        this.loadData();
    },
    
    deleteSelf: function(self){
        self.removeAll(true);
        self.destroy();
    },
    
    loadData: function(){
        if(this.value) this.setValue(this.value);
    }
    
});
