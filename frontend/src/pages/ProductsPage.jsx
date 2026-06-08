import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/products/ProductCard';
import SearchBar from '../components/common/SearchBar';
import FilterSidebar from '../components/products/FilterSidebar';
import './ProductsPage.css';

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products);

    const filters = React.useMemo(() => ({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest'
    }), [searchParams]);

    const categories = [
        { id: 'vegetables', label: 'Vegetables' },
        { id: 'fruits', label: 'Fruits' },
        { id: 'grains', label: 'Grains' },
        { id: 'livestock', label: 'Livestock' },
        { id: 'dairy', label: 'Dairy' },
        { id: 'other', label: 'Other' }
    ];

    // Prevent request spam: only fetch when user explicitly changes params
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedFilters(filters), 400);
        return () => clearTimeout(t);
    }, [filters]);

    useEffect(() => {
        dispatch(fetchProducts(debouncedFilters));
    }, [debouncedFilters, dispatch]);


    const handleFilterChange = (name, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(name, value);
        } else {
            newParams.delete(name);
        }
        setSearchParams(newParams);
    };

    // Filter products to only show physical agricultural products
    const agriculturalProducts = products?.filter(p => 
        categories.some(cat => cat.id === p.category) || !p.category
    );

    return (
        <div className="products-page">
            {/* Premium Hero Banner */}
            <div className="products-hero-modern">
                <div className="hero-background-effects">
                    <div className="glow-orb orb-1"></div>
                    <div className="glow-orb orb-2"></div>
                </div>
                <div className="container hero-content-modern">
                    <div className="hero-text-content">
                        <h1>Fresh From <span className="text-gradient">The Farm</span></h1>
                        <p>Discover premium agricultural produce directly from local farmers.</p>
                    </div>
                    <div className="hero-search-glass">
                        <SearchBar
                            onSearch={(value) => handleFilterChange('search', value)}
                            placeholder="Search fresh tomatoes, organic honey, maize..."
                            initialValue={filters.search}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="products-container container">
                {/* Filters Sidebar */}
                <aside className="filters-sidebar">
                    <div className="sidebar-header">
                        <h3>Filters</h3>
                        <button className="reset-btn" onClick={() => setSearchParams({})}>Reset</button>
                    </div>

                    <div className="filter-group">
                        <h4><i className="fas fa-layer-group"></i> Category</h4>
                        <div className="category-list">
                            {categories.map(cat => (
                                <label key={cat.id} className={`filter-chip ${filters.category === cat.id ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value={cat.id}
                                        checked={filters.category === cat.id}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="hidden-radio"
                                    />
                                    <span>{cat.label}</span>
                                </label>
                            ))}
                        </div>
                        {filters.category && (
                            <button
                                className="clear-filter"
                                onClick={() => handleFilterChange('category', '')}
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>

                    <div className="filter-group">
                        <h4><i className="fas fa-tags"></i> Price Range (KES)</h4>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="form-control"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h4><i className="fas fa-sort-amount-down"></i> Sort By</h4>
                        <select
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="form-control"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </aside>

                {/* Products Grid */}
                <main className="products-main">
                    <div className="products-header">
                        <h2>{filters.category ? categories.find(c => c.id === filters.category)?.label : 'All Produce'}</h2>
                        <span className="products-badge">{agriculturalProducts?.length || 0} Results</span>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading fresh produce...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{error}</p>
                        </div>
                    ) : agriculturalProducts && agriculturalProducts.length > 0 ? (
                        <div className="products-grid">
                            {agriculturalProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <i className="fas fa-search"></i>
                            <h3>No produce found</h3>
                            <p>Try adjusting your filters or search terms</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductsPage;
