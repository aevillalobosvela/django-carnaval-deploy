# Generated by Django 5.1.3 on 2025-04-21 00:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("myapp", "0009_comentario_rating"),
    ]

    operations = [
        migrations.AlterField(
            model_name="punto_conoce",
            name="imagen_ruta",
            field=models.ImageField(upload_to="imagenes/"),
        ),
    ]
