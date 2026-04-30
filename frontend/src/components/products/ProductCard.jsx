import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  const displayImage = product.images && product.images.length > 0 ? product.images[0] : product.image_url;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const isOutOfStock = product.quantity !== undefined && product.quantity <= 0;

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      {/* Image Section */}
      <div className="pc-image-wrapper">
        {displayImage ? (
          <img src={displayImage} alt={product.name} className="pc-image" loading="lazy" />
        ) : (
          <div className="pc-placeholder">
            <i className="fas fa-seedling" />
          </div>
        )}
        
        {/* Category Badge */}
        {product.category && (
          <span className="pc-badge">
            {product.category}
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="pc-out-of-stock">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="pc-content">
        <h3 className="pc-title">{product.name}</h3>
        
        {(product.farmer_name || product.county) && (
          <p className="pc-location">
            <i className="fas fa-map-marker-alt" />
            {product.county || 'Nairobi, Kenya'}
          </p>
        )}

        {product.description && (
          <p className="pc-description">
            {product.description}
          </p>
        )}

        {/* Footer with Price and Button */}
        <div className="pc-footer">
          <div className="pc-price-wrap">
            <span className="pc-price">
              KES {parseFloat(product.price || 0).toLocaleString()}
            </span>
            <span className="pc-unit">per {product.unit || 'kg'}</span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="pc-add-btn"
            title="Add to Cart"
          >
            <i className="fas fa-cart-plus" />
          </button>
        </div>

        {/* Low Stock Warning */}
        {!isOutOfStock && product.quantity <= 10 && product.quantity > 0 && (
          <div className="pc-stock-alert">
            <i className="fas fa-bolt" />
            Only {product.quantity} left!
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
