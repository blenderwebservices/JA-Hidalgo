## Prompts y Despliegue

1.
crea una app filament php con sqlite como base de datos, genera seeds con la informacion actual, conserva el backend con lo que hay ahora (aplicando los cambios de la base de datos). En el front coloca un landing que explique lo que hace la app (administrador de condominios), pon acceso al dashboard , opciones para login y registro. En el back pon un crud para usuarios , todos para role admin y solo datos para role condomino. Utiliza los assets para ilustrar el encabezado y el logo.
2.
en el dashboard elimina el widget de filament. Agrega widgets relevantes. En el backend coloca un acceso al front. En el Dashboard interactivo coloca un acceso al dashboard principal.
3.
algo no funciona con el link al panel admin principal (ruta /admin ), corrige.
4. Despliegue
    subir a un repositorio github:
    https://github.com/blenderwebservices/JA-Hidalgo

    servidor de dominios; elegir un dominio e ir a dns, crear un registro A (servidor: subdominio), direccion IP

    servidor linux:
    crear un subdominio, apuntando a /public

    generar un ssl y obtener la llave

    servidor de dominios; crear un registro TXT para _acme-challenge subdominio,  y poner la llave. Confirmar.

    servidor linux
    confirmar el ssl. Terminar de configurar el ssl.

    Ir al administrador de github, crear un registro apuntando a la cuenta de github y al repositorio
    recuperar y desplegar
    