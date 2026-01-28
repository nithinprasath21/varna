export default function ProductList({ products }) {
    if (!products || products.length === 0) {
        return <div className="p-4 text-gray-500">No products found. Start adding some!</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-bold text-lg text-secondary mb-1">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 flex-grow">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                        <span className="font-bold text-primary">₹{product.base_price}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Stock: {product.stock_qty}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
