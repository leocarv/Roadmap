# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'SecurityTest'
        db.create_table('rest_securitytest', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
        ))
        db.send_create_signal('rest', ['SecurityTest'])


    def backwards(self, orm):
        
        # Deleting model 'SecurityTest'
        db.delete_table('rest_securitytest')


    models = {
        'rest.dummy': {
            'Meta': {'object_name': 'Dummy'},
            'dummy_stuff': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['rest.DummyStuff']", 'symmetrical': 'False'}),
            'dummy_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['rest.DummyType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'rest.dummystuff': {
            'Meta': {'object_name': 'DummyStuff'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'rest.dummytype': {
            'Meta': {'object_name': 'DummyType'},
            'clearof': ('netvision.models.OneToOneField', [], {'related_name': "'clearedby'", 'unique': 'True', 'null': 'True', 'to': "orm['rest.DummyType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'rest.securitytest': {
            'Meta': {'object_name': 'SecurityTest'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['rest']
