<h1>
NestJS Microservice Files Upload Decorator
</h1>

<h2>
Описание: 
</h2>

<ul>
    <li>
        Декоратор параметра контроллера в микросервисе NestJS;
    </li>
    <li>
        Позволяет принимать файлы типа Express.Multer.File | Express.Multer.File[] и сохранать их;
    </li>
    <li>
        После сохранения файла, объект запроса (DTO) модифицируется - объект файла (Express.Multer.File | Express.Multer.File[]) трансформируется в имя сохраненного файла (string[]).
    </li>
</ul>

<h2>
Пример использования:
</h2>

<p>
Передача файла с Gateway на Microservice для последующего сохранения с помощью <b>nmfu-decorator</b>
</p>