# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'DummyStuff'
        db.create_table('rest_dummystuff', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
        ))
        db.send_create_signal('rest', ['DummyStuff'])

        # Adding model 'DummyType'
        db.create_table('rest_dummytype', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('clearof', self.gf('netvision.models.OneToOneField')(related_name='clearedby', unique=True, null=True, to=orm['rest.DummyType'])),
        ))
        db.send_create_signal('rest', ['DummyType'])

        # Adding model 'Dummy'
        db.create_table('rest_dummy', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('dummy_type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['rest.DummyType'])),
        ))
        db.send_create_signal('rest', ['Dummy'])

        # Adding M2M table for field dummy_stuff on 'Dummy'
        db.create_table('rest_dummy_dummy_stuff', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('dummy', models.ForeignKey(orm['rest.dummy'], null=False)),
            ('dummystuff', models.ForeignKey(orm['rest.dummystuff'], null=False))
        ))
        db.create_unique('rest_dummy_dummy_stuff', ['dummy_id', 'dummystuff_id'])


    def backwards(self, orm):
        
        # Deleting model 'DummyStuff'
        db.delete_table('rest_dummystuff')

        # Deleting model 'DummyType'
        db.delete_table('rest_dummytype')

        # Deleting model 'Dummy'
        db.delete_table('rest_dummy')

        # Removing M2M table for field dummy_stuff on 'Dummy'
        db.delete_table('rest_dummy_dummy_stuff')


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
        }
    }

    complete_apps = ['rest']
