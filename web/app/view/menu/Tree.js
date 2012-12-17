var storeTree = Ext.create('Ext.data.TreeStore', {
    fields: ['tela', 'text', 'leaf'],
    root: {
        expanded: true,
        children: [
            { text: "Product Spec", leaf: true, tela: 'specList' },            
            { text: "Product", leaf: true, tela: 'prodList' }
            /*
            { text: "homework", expanded: true, children: [
                { text: "book report", leaf: true },
                { text: "alegrbra", leaf: true}
            ] },*/
        ]
    }
});

Ext.define('AM.view.menu.Tree', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.menutree',
    store: storeTree,
    width: 165
});