import { PrismaClient, Role, OrderStatus, OrderItemStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean DB
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const SEED_SIZE = process.env.SEED_SIZE || 'medium';
  
  let numCustomers = 50;
  let numVendors = 20;
  let numProducts = 500;
  let numOrders = 2000;

  if (SEED_SIZE === 'small') {
    numCustomers = 10;
    numVendors = 5;
    numProducts = 50;
    numOrders = 100;
  } else if (SEED_SIZE === 'large') {
    numCustomers = 500;
    numVendors = 100;
    numProducts = 5000;
    numOrders = 20000;
  }

  console.log(`Seeding with size: ${SEED_SIZE} (${numCustomers} customers, ${numVendors} vendors, ${numProducts} products, ${numOrders} orders)`);

  // 1. Generate Users
  const usersToCreate = [];
  
  // Admin
  usersToCreate.push({
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    role: Role.ADMIN,
    createdAt: faker.date.past(),
  });

  // Vendors
  for (let i = 0; i < numVendors; i++) {
    usersToCreate.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.VENDOR,
      createdAt: faker.date.past(),
    });
  }

  // Customers
  for (let i = 0; i < numCustomers; i++) {
    usersToCreate.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.CUSTOMER,
      createdAt: faker.date.past(),
    });
  }

  await prisma.user.createMany({ data: usersToCreate });
  
  const allVendors = await prisma.user.findMany({ where: { role: Role.VENDOR } });
  const allCustomers = await prisma.user.findMany({ where: { role: Role.CUSTOMER } });

  // 2. Generate Products
  const categories = ['Electronics', 'Books', 'Clothing', 'Gaming', 'Accessories', 'Home Decor', 'Fitness'];
  const productsToCreate = [];

  for (let i = 0; i < numProducts; i++) {
    productsToCreate.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      stock: faker.number.int({ min: 10, max: 500 }),
      category: faker.helpers.arrayElement(categories),
      isActive: faker.datatype.boolean(0.9), // 90% chance to be active
      vendorId: faker.helpers.arrayElement(allVendors).id,
      createdAt: faker.date.past(),
    });
  }

  // Insert Products in chunks to handle large seeds
  const productChunkSize = 1000;
  for (let i = 0; i < productsToCreate.length; i += productChunkSize) {
    await prisma.product.createMany({
      data: productsToCreate.slice(i, i + productChunkSize),
    });
  }

  const allProducts = await prisma.product.findMany();

  // 3. Generate Orders
  console.log('Generating Orders... this might take a minute.');
  
  const statuses = Object.values(OrderStatus);
  const itemStatuses = Object.values(OrderItemStatus);

  const ordersData = [];
  
  for (let i = 0; i < numOrders; i++) {
    ordersData.push({
      customerId: faker.helpers.arrayElement(allCustomers).id,
      orderStatus: faker.helpers.arrayElement(statuses),
      totalAmount: 0, 
      createdAt: faker.date.recent({ days: 365 }),
    });
  }
  
  const orderChunkSize = 5000;
  for (let i = 0; i < ordersData.length; i += orderChunkSize) {
    await prisma.order.createMany({
      data: ordersData.slice(i, i + orderChunkSize),
    });
  }

  const allOrders = await prisma.order.findMany();

  let orderItemsData = [];
  
  for (const order of allOrders) {
    const numItems = faker.number.int({ min: 1, max: 5 });
    let totalAmount = 0;
    
    // Select unique products for this order
    const selectedProducts = faker.helpers.arrayElements(allProducts, numItems);

    for (const product of selectedProducts) {
      const quantity = faker.number.int({ min: 1, max: 5 });
      totalAmount += product.price * quantity;
      
      orderItemsData.push({
        orderId: order.id,
        productId: product.id,
        vendorId: product.vendorId,
        quantity,
        priceAtOrder: product.price,
        status: faker.helpers.arrayElement(itemStatuses),
      });
    }

    // Since we can't update using createMany easily, we can just update the orders after
    // Actually, to make it fast, we can bulk update if possible, or just skip it for a second.
    // Let's do individual updates for totalAmount, or raw query.
    await prisma.$executeRawUnsafe(`UPDATE "Order" SET "totalAmount" = ${totalAmount} WHERE id = ${order.id}`);
  }

  // Insert Order Items in chunks
  const chunkSize = 1000;
  for (let i = 0; i < orderItemsData.length; i += chunkSize) {
    await prisma.orderItem.createMany({
      data: orderItemsData.slice(i, i + chunkSize),
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
