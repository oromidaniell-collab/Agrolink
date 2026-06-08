import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/products/ProductCard';
import SearchBar from '../components/common/SearchBar';
import './ServicesPage.css';

const ServicesPage = () => {
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

    // Service-specific categories
    const serviceCategories = [
        { id: 'transport', label: 'Transport & Logistics', icon: 'fa-truck' },
        { id: 'advisory', label: 'Agri Advisory', icon: 'fa-user-tie' },
        { id: 'input-supplies', label: 'Input Supplies', icon: 'fa-seedling' },
        { id: 'market-linkage', label: 'Market Linkage', icon: 'fa-handshake' }
    ];

    // Prevent request spam: debounce URL-driven fetch
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

    // Filter products to only show those belonging to service categories
    const serviceProducts = products?.filter(p => 
        serviceCategories.some(sc => sc.id === p.category)
    );

    return (
        <div className="services-page">
            {/* Premium Services Hero */}
            <div className="services-hero">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <h1>Expert <span className="text-highlight">Agricultural</span> Services</h1>
                    <p>Connecting you with logistics, advisory, and the tools you need to grow your farm business.</p>
                    <div className="hero-search">
                        <SearchBar
                            onSearch={(value) => handleFilterChange('search', value)}
                            placeholder="Search logistics, advisory, inputs..."
                            initialValue={filters.search}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="services-container container">
                {/* Category Navigation */}
                <aside className="services-sidebar">
                    <h3>Our Services</h3>
                    <div className="service-nav">
                        <button 
                            className={`nav-item ${!filters.category ? 'active' : ''}`}
                            onClick={() => handleFilterChange('category', '')}
                        >
                            <i className="fas fa-th-large"></i> All Services
                        </button>
                        {serviceCategories.map(cat => (
                            <button 
                                key={cat.id} 
                                className={`nav-item ${filters.category === cat.id ? 'active' : ''}`}
                                onClick={() => handleFilterChange('category', cat.id)}
                            >
                                <i className={`fas ${cat.icon}`}></i> {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="price-filter-box">
                        <h4>Price Range (KES)</h4>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            />
                            <span>to</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
                        </div>
                    </div>
                </aside>

                {/* Services Grid */}
                <main className="services-main">
                    <div className="services-header">
                        <h2>
                            {filters.category 
                                ? serviceCategories.find(c => c.id === filters.category)?.label 
                                : 'Available Services'}
                        </h2>
                        <span className="results-count">{serviceProducts?.length || 0} Found</span>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading expert services...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>{error}</p>
                        </div>
                    ) : serviceProducts && serviceProducts.length > 0 ? (
                        <div className="services-grid">
                            {serviceProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fas fa-search"></i>
                            </div>
                            <h3>No services found</h3>
                            <p>Try adjusting your search or category filters.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ServicesPage;
