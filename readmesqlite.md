# phpLiteAdmin - Administrador de SQLite

Se ha configurado la herramienta `phpLiteAdmin` en este proyecto de Laravel para poder gestionar directamente la base de datos `database.sqlite` (tanto en local como en producción) de forma segura.

## Ubicación de los archivos

- El programa se encuentra alojado en `public/phpliteadmin/`.
- El archivo principal ha sido renombrado a `index.php` para que sea accesible desde `http://tu-dominio.com/phpliteadmin/` o en tu entorno local (ej. `http://ja-hidalgo.test/phpliteadmin/`).
- La configuración se maneja mediante `public/phpliteadmin/phpliteadmin.config.php`.

## 🛡️ Seguridad y Configuración (Importante)

Para garantizar la seguridad de la base de datos, especialmente en **producción**, la configuración de `phpLiteAdmin` está vinculada a tu archivo `.env` de Laravel.

Se han añadido las siguientes variables al archivo `.env` (y `.env.example`):

```env
PHPLITEADMIN_ENABLED=true
PHPLITEADMIN_PASSWORD=SuperSecretPassword123
```

- **`PHPLITEADMIN_ENABLED`**: Debe estar en `true` para que el panel cargue. Si está en `false` o no existe, la herramienta estará completamente bloqueada mostrando un error 403 (Forbidden).
- **`PHPLITEADMIN_PASSWORD`**: La contraseña para acceder. **NO** puede ser `admin` ni `cambiame_por_favor`. Si usas una contraseña por defecto o está vacía, el panel no te dejará entrar por seguridad.

### 🚀 ¿Cómo usarlo en el próximo despliegue a producción?

1. En tu servidor de producción, asegúrate de que el archivo `.env` tenga las variables:
   ```env
   PHPLITEADMIN_ENABLED=true
   PHPLITEADMIN_PASSWORD=elige_una_contraseña_fuerte_y_segura
   ```
2. Accede en el navegador a: `https://dominio-produccion.com/phpliteadmin/`
3. Ingresa la contraseña configurada en el `.env`.
4. ¡Listo! Podrás editar la base de datos `database.sqlite` directamente.
5. *(Opcional pero recomendado)* Cuando termines tus tareas de mantenimiento en producción, puedes cambiar `PHPLITEADMIN_ENABLED=false` en el `.env` para deshabilitar temporalmente el acceso hasta que lo vuelvas a necesitar, sin tener que borrar los archivos.

## Notas adicionales
- `phpLiteAdmin` solo apuntará a `/database/database.sqlite`. Si alguna vez cambias el nombre de la base de datos o su ubicación, deberás actualizar la ruta en `public/phpliteadmin/phpliteadmin.config.php`.
