Ext.define('Ext.ux.form.DynamicFilterFields', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.dynamicfilterfields',
    allowAddition: true,
    scope: this,
    operator_store: null,
    fields_store: null,
    mixins: {
        field: 'Ext.form.field.Field'
    },
    title: 'Filtro',
    items: [
        {
            xtype:'fieldset',
            layout: {
                 labelAlign :'top',
                 labelWidth: 10
            },
            title: gettext('Campos para filtragem'),
            itemId:'fieldsetdynamicfilter',
            disabled: true,
            width: 800,
            //collapsible: true,
            labelAlign : 'top',
            defaultType: 'textfield',
            layout: 'anchor',
            items: [
                {
                    xtype:'container',
                    layout: 'hbox',
                    labelAlign : 'right',
                    itemId: 'containerfilterfields',
                    items: [
                        {
                            xtype: 'combobox',
                            itemId: 'cmbFields',
                            queryMode: 'local',
                            labelAlign :'top',
                            labelWidth: 40,
                            name: 'field',
                            displayField: 'name',
                            fieldLabel: gettext('Campo'),
                            valueField: 'search_key',
                            editable: false,
                            store: 'Dummy',
                            listeners: {
                                select: function(combo) {
                                    var store = combo.store;
                                    if(store.data){
                                        var record = store.findRecord('name', combo.rawValue);
                                        var view = combo.up('dynamicfilterfields');
                                        view.plotField(record, view);
                                    }
                                }
                            }
                        },
                        {
                            queryMode: 'local',
                            name: 'operator',
                            xtype: 'combobox',
                            labelAlign :'top',
                            labelWidth: 60,
                            fieldLabel: gettext('Operador'),
                            margin: '0 0 0 5',
                            displayField: 'name',
                            valueField: 'id',
                            editable: false,
                            store: 'admin.OperatorNE'
                        },
                        {
                            xtype: 'container',
                            itemId: 'fieldsFieldsetFilter',
                            items: [
                                {
                                    columnWidth: 1,
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            name: 'value',
                                            labelAlign :'top',
                                            labelWidth: 60,
                                            fieldLabel: gettext('Valor')
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'button',
                            cls: 'nv-icon-add',
                            text: '',
                            margin: '10 0 0 5',
                            handler: function() {
                                var component = this.up('dynamicfilterfields');
                                var grid = component.down('[itemId=filterFieldsGrid]');
                                var store = grid.store;

                                var item = component._getFilterValue(component);

                                if (!item) { return false; }
                                
                                store.insert(0, item);
                            },
                            tooltip: gettext('Novo')
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    itemId: 'filterFieldsGrid',
                    store: 'Dummy',
                    region: 'west',
                    autoscroll: true,
                    width: 765,
                    height: 250,
                    padding: '5 0 5 0',
                    autoExpandColumn: 'label',
                    selType: 'rowmodel',
                    columns: [
                        {
                            xtype: 'actioncolumn',
                            width: 25,
                            menuDisabled:true,
                            items: [
                                {
                                    iconCls: 'nv-icon-delete',
                                    icon: '/static/resources/images/icons/famfam/delete.png', // TODO: remove
                                    itemId: 'deleteTicketTemplate',
                                    height: 10,
                                    handler: function(grid, rowIndex, colIndex) {
                                        var store = grid.store;
                                        var record = store.getAt(rowIndex);
                                        store.remove(record);                                
                                    },
                                    tooltip: gettext('Remover')
                                }
                            ],
                            header: ''
                        },
                        {   
                            xtype: 'templatecolumn',
                            text: gettext('Nome'),
                            flex: 0.3,
                            menuDisabled:true,
                            tpl: '{field.name}'
                        },
                        {   
                            xtype: 'templatecolumn',
                            text: gettext('Operador'),
                            flex: 0.3,
                            menuDisabled:true,
                            tpl: '{operator.name}'
                        },
                        {   
                            xtype: 'templatecolumn',
                            text: gettext('Valor'),
                            flex: 0.3,
                            menuDisabled:true,
                            tpl: '{value.name}'
                        }
                    ]
                }
            ]
        }
    ],

    initComponent: function(){
        this.callParent(arguments);
        this.initField();
        this.fieldCombo = this.down('combobox[name=field]');
        this.operatorCombo = this.down('combobox[name=operator]');
        this.grid = this.down('grid[itemId=filterFieldsGrid]');
    },

    getFieldStore: function() {
        return  this.down('combobox[name=field]').getStore();
    },

    getFieldCombo: function() {
        return this.down('combobox[name=field]');
    },
    getFieldsetFilter: function(){
        return this.down('[itemId=fieldsetdynamicfilter]');
    },
    getValue: function(){
        var filterStore =  this.down('grid[itemId=filterFieldsGrid]').store,
            filterFields = [];
        filterStore.each(function(item, index){

            var field_name = item.get('field').id ? null : item.get('field').search_key; 

            filterFields.push({
                id: item.get('id'),
                field_id: item.get('field').id, 
                field_name: field_name,
                operation: item.get('operator').id,
                value: item.get('value').id 
            });
        });

        return filterFields;
    },
    
    _getFilterValue: function(view){
        var errors = false,
            value = this.down('[name=value]'),
            fieldSel = this.fieldCombo.getValue(),
            operatorSel = this.operatorCombo.getValue();
        
        if(!fieldSel){
            this.fieldCombo.markInvalid(gettext('campo inválido'));
            errors = true;
        }
        
        if(!operatorSel){
            this.operatorCombo.markInvalid(gettext('campo inválido'));
            errors = true;
        }

        if(value && !value.getValue()){
            value.markInvalid(gettext('campo inválido'));
            errors = true;
        }
        
        if (errors) {
            Netvision.util.NotificationManager.warning({
                title: gettext('Filtro'),
                message: gettext('Todos os campos são obrigatórios.')
            });
            return false;
        }
        
        var recordField = this.fieldCombo.getStore().findRecord('search_key', fieldSel);
        var recordOperator = this.operatorCombo.getStore().findRecord('id', operatorSel);
        
        var recordValue = {
            id: value.getValue(),
            name: value.getRawValue()
        }; 
        
        var value_required = recordValue.id ? recordField.get('field_type').name == 'Boolean' : true;
        
        if (recordField.get('field_type').id == 5){
            recordValue.name = recordValue.name ? gettext('Sim') : gettext('Não');
        }

        var row = {
            'field': recordField.data,
            'operator': recordOperator.data, 
            'value': recordValue
        };

        this.fieldCombo.reset();
        this.operatorCombo.reset();

        var value_temp = this.down('[itemId=fieldsFieldsetFilter]');
        value_temp.items.getAt(0).removeAll(true);

        return row;
    },

    setValue: function (values){
        var filterStore = this.down('grid[itemId=filterFieldsGrid]').getStore(),
            fieldStore = this.down('combobox[name=field]').getStore(), 
            operatorStore = this.down('combobox[name=operator]').getStore();
            
        Ext.each(values, function(item, index){

            var operator = operatorStore.findRecord('id', item.operation),
                field, valueName = item.value, row;

            var field_name = item.field ? item.field.id : item.field_name;
            
            field = fieldStore.findRecord('search_key', field_name);
            
            if (item.possiblevalue_set) {
                item.possiblevalue_set.forEach(function (pv, index) {
                    if (pv.id == item.value) {
                        valueName = pv.name;
                    }
                })
            } 

            switch (field.data.field_type.id){
                case 5:
                    //Boolean
                    if(valueName){
                        valueName = gettext('Sim');
                    } else {
                        valueName = gettext('Não');
                    }
                    break;
                case 7:
                   //Date
                    valueName = valueName.split('-');
                    valueName = valueName[2]+'/'+valueName[1]+'/'+valueName[0];
                    break;
            }

            row = {
                'field': field.data,
                'operator': operator.data, 
                'value': { id: item.value, name: valueName }
            };
            filterStore.add(row);
       
        }, this);
    },

    setFilterFieldsStore: function(store) {
        if (!store) {
            throw 'o "store" nao foi especificado, impossivel prosseguir!';
        }

        var grid = this.up().down('grid[itemId=filterFieldsGrid]');
        grid.reconfigure(store);
    },

    setFieldsStore: function (store) {
        if (!store) {
            throw 'o "store" nao foi especificado, impossivel prosseguir!';
        }

        var combo = this.up().down('combobox[itemId=cmbFields]');

        combo.store = null;
        combo.bindStore(store);
    },
    
    clear: function () {
        var grid = this.down('grid[itemId=filterFieldsGrid]');
        var fieldCombo = this.down('combobox[name=field]');
        var operatorCombo = this.down('combobox[name=operator]');

        fieldCombo.reset();
        
        fieldCombo.store.clearData();

        operatorCombo.reset();
        var objvalue = this.down('[itemId=fieldsFieldsetFilter]');
        objvalue.items.getAt(0).removeAll(true);
        
        grid.store.removeAll();
        this.getFieldsetFilter().setDisabled(true);
    },

    plotField: function(record, view){
        if (!record) {
            return false;
        }
    
        fieldAtts = {
                name: 'value',
                fieldLabel: gettext('Valor'),
                labelWidth: 80,
                margin: '0 0 0 10',
                labelAlign: 'top'
        };

        var field_type = null;

        var typeClass;
        var maxLengthText = gettext('Limite máximo de caractéres atingido.');
        switch (record.data.field_type.id){
            case 1:
                typeClass = 'Ext.form.field.Text';
                fieldAtts['maxLength'] = 255;
                fieldAtts['maxLengthText'] = maxLengthText;
                break;
            case 2:
                typeClass = 'Ext.form.field.TextArea';
                fieldAtts['maxLength'] = 255;
                fieldAtts['maxLengthText'] = maxLengthText;
                break;
            case 3:
                typeClass = 'Ext.form.field.Number';
                fieldAtts['allowDecimals'] = false;
                break;
            case 4:
                typeClass = 'Ext.form.field.Number';
                fieldAtts['allowDecimals'] = true;
                break;
            case 5:
                typeClass = 'Ext.form.field.Checkbox';
                fieldAtts['inputValue'] = true;
                fieldAtts['allowBlank'] = true;
                fieldAtts['uncheckedValue'] = false;
                fieldAtts['width'] = 150;
                break;
            case 6:
                typeClass = 'Ext.form.field.ComboBox';
                fieldAtts['store'] = Ext.create('Ext.data.Store', {fields: ['id', 'name'],data : record.data.possiblevalue_set});
                fieldAtts['fields'] = ['id', 'name'];
                fieldAtts['queryMode'] = 'local';
                fieldAtts['displayField'] = 'name';
                fieldAtts['valueField'] = 'name';
                fieldAtts['editable'] = true;
                break;
            case 7:
                typeClass = 'Ext.ux.form.DateField';
                fieldAtts['width'] = 150;
                fieldAtts['format'] = 'd/m/Y';
                break;
            case 8:
                typeClass = 'Ext.ux.form.DateTimeField';
                fieldAtts['width'] = 300;
                break;
            case 9:
                typeClass = 'Ext.ux.form.IntervalField';
                fieldAtts['width'] = 300;
                break;
            case 10:
                typeClass = "Ext.form.field.ComboBox";
                fieldAtts['store'] = Ext.create('Netvision.store.servicedesk.Criticity');
                fieldAtts['fields'] = ['id', 'name'];
                fieldAtts['queryMode'] = 'local';
                fieldAtts['displayField'] = 'name';
                fieldAtts['valueField'] = 'name';
                fieldAtts['editable'] = true;
                break;

            default:
                typeClass = 'Ext.form.field.Text';
                fieldAtts['maxLength'] = 255;
                fieldAtts['maxLengthText'] = maxLengthText;
                break;
        }

        var newObj = Ext.create(typeClass, fieldAtts);

        var objvalue = view.down('[itemId=fieldsFieldsetFilter]');
        objvalue.items.getAt(0).removeAll(true);
        objvalue.items.getAt(0).add(newObj);
        view.doLayout();
    }
});
