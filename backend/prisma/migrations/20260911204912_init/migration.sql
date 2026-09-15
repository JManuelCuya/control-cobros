-- CreateTable
CREATE TABLE `rol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_de_usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NULL,
    `correo` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `id_rol` INTEGER NULL,
    `id_tipo_usuario` INTEGER NULL,

    UNIQUE INDEX `usuario_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empleado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NULL,
    `id_cliente` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provincia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,
    `id_departamento` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `distrito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,
    `id_provincia` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `fecha_nacimiento` DATETIME(3) NULL,
    `direccion` VARCHAR(191) NULL,
    `id_departamento` INTEGER NULL,
    `id_provincia` INTEGER NULL,
    `id_distrito` INTEGER NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `correo` VARCHAR(191) NULL,
    `tipo_doc` VARCHAR(191) NULL,
    `num_doc` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `razon_social` VARCHAR(191) NOT NULL,
    `fecha_nacimiento` DATETIME(3) NULL,
    `direccion` VARCHAR(191) NULL,
    `id_departamento` INTEGER NULL,
    `id_provincia` INTEGER NULL,
    `id_distrito` INTEGER NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `correo` VARCHAR(191) NULL,
    `tipo_doc` VARCHAR(191) NULL,
    `num_doc` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoria_plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `id_categoria_plan` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoria_producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `id_categoria_producto` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` DECIMAL(10, 2) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `id_cliente` INTEGER NOT NULL,
    `id_empleado` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pedido` INTEGER NOT NULL,
    `id_producto` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unit` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimiento_inventario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_movimiento` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacion` VARCHAR(191) NULL,
    `id_producto` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_id_rol_fkey` FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_id_tipo_usuario_fkey` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `tipo_de_usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Empleado` ADD CONSTRAINT `Empleado_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Empleado` ADD CONSTRAINT `Empleado_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provincia` ADD CONSTRAINT `provincia_id_departamento_fkey` FOREIGN KEY (`id_departamento`) REFERENCES `departamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distrito` ADD CONSTRAINT `distrito_id_provincia_fkey` FOREIGN KEY (`id_provincia`) REFERENCES `provincia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente` ADD CONSTRAINT `cliente_id_departamento_fkey` FOREIGN KEY (`id_departamento`) REFERENCES `departamento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente` ADD CONSTRAINT `cliente_id_provincia_fkey` FOREIGN KEY (`id_provincia`) REFERENCES `provincia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente` ADD CONSTRAINT `cliente_id_distrito_fkey` FOREIGN KEY (`id_distrito`) REFERENCES `distrito`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proveedor` ADD CONSTRAINT `proveedor_id_departamento_fkey` FOREIGN KEY (`id_departamento`) REFERENCES `departamento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proveedor` ADD CONSTRAINT `proveedor_id_provincia_fkey` FOREIGN KEY (`id_provincia`) REFERENCES `provincia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proveedor` ADD CONSTRAINT `proveedor_id_distrito_fkey` FOREIGN KEY (`id_distrito`) REFERENCES `distrito`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planes` ADD CONSTRAINT `planes_id_categoria_plan_fkey` FOREIGN KEY (`id_categoria_plan`) REFERENCES `categoria_plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producto` ADD CONSTRAINT `producto_id_categoria_producto_fkey` FOREIGN KEY (`id_categoria_producto`) REFERENCES `categoria_producto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_id_empleado_fkey` FOREIGN KEY (`id_empleado`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido` ADD CONSTRAINT `detalle_pedido_id_pedido_fkey` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido` ADD CONSTRAINT `detalle_pedido_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento_inventario` ADD CONSTRAINT `movimiento_inventario_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
