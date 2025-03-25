import 'server-only';

type SelectProduct = {
  id: number;
  imageUrl: string;
  name: string;
  status: string;
  price: number;
  stock: number;
  availableAt: Date;
};


export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
} | undefined> {
  // Always search the full table, not per page
  if (search) {
    // return {
    //   products: await db
    //     .select()
    //     .from(products)
    //     .where(ilike(products.name, `%${search}%`))
    //     .limit(1000),
    //   newOffset: null,
    //   totalProducts: 0
    // };

    return {
      products: fakeProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  // let totalProducts = await db.select({ count: count() }).from(products);
  // let moreProducts = await db.select().from(products).limit(5).offset(offset);
  // let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  // return {
  //   products: moreProducts,
  //   newOffset,
  //   totalProducts: totalProducts[0].count
  // };

  return {
    products: fakeProducts.slice(offset, offset + 5),
    newOffset: offset + 5,
    totalProducts: fakeProducts.length
  };
}

export async function deleteProductById(id: number) {
  // await db.delete(products).where(eq(products.id, id));
  return true;
}


const fakeProducts = [{
  id: 1,
  imageUrl: 'https://via.placeholder.com/150',
  name: 'Product 1',
  status: 'active' as const,
  price: 100,
  stock: 10,
  availableAt: new Date()
}, {
  id: 2,
  imageUrl: 'https://via.placeholder.com/150',
  name: 'Product 2',
  status: 'active',
  price: 200,
  stock: 20,
  availableAt: new Date()
}, {
  id: 3,
  imageUrl: 'https://via.placeholder.com/150',
  name: 'Product 3',
  status: 'active',
  price: 300,
  stock: 30,
  availableAt: new Date()
}, {
  id: 4,
  imageUrl: 'https://via.placeholder.com/150',
  name: 'Product 4',
  status: 'active',
  price: 400,
  stock: 40,
  availableAt: new Date()
}, {
  id: 5,
  imageUrl: 'https://via.placeholder.com/150',
  name: 'Product 5',
  status: 'active',
  price: 500,
  stock: 50,
  availableAt: new Date()
}
];