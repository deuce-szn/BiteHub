import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { trackOrderById, updateFoodStatus } from '../../services/orderService';
import NotFound from '../../components/NotFound/NotFound';
import classes from './orderTrackPage.module.css';
import DateTime from '../../components/DateTime/DateTime';
import OrderItemsList from '../../components/OrderItemsList/OrderItemsList';
import Title from '../../components/Title/Title';
import Map from '../../components/Map/Map';
import StarRating from '../../components/Rating/Rating'; // Reusable StarRating Component
import Modal from '../../components/Modal/Modal'; // Reusable Modal Component

export default function OrderTrackPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState();
  const [isRatingOpen, setIsRatingOpen] = useState(false); // Controls the rating modal
  const [rating, setRating] = useState(0); // Stores the user's rating
  const [isThankYouVisible, setIsThankYouVisible] = useState(false); // Controls the thank-you message
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      trackOrderById(orderId)
        .then(order => {
          setOrder(order);
        })
        .catch(() => {
          navigate('/orders');
        });
    }
  }, [orderId, navigate]);

  const handleFoodStatusUpdate = async () => {
    try {
      const updatedOrder = await updateFoodStatus(order.id, 'PICKED UP');
      setOrder(updatedOrder); // Immediately update order state with the new food status
      setIsRatingOpen(true); // Open the rating modal
    } catch (error) {
      console.error('Failed to update food status', error);
    }
  };

  const handleRatingSubmit = () => {
    setIsRatingOpen(false); // Close the modal
    setIsThankYouVisible(true); // Show the thank-you message
    setTimeout(() => setIsThankYouVisible(false), 3000); // Auto-hide after 3 seconds
  };

  if (!orderId) {
    return <NotFound message="Order Not Found" linkText="Go To Home Page" />;
  }

  return (
    order && (
      <div className={classes.container}>
        <div className={classes.content}>
          <Title title={`Order #${order.id}`} fontSize="2rem" margin="1rem 0" />

          <div className={classes.header}>
            <div className={classes.info}>
              <strong>Date</strong>
              <DateTime date={order.createdAt} />
            </div>
            <div className={classes.info}>
              <strong>Name</strong>
              {order.name}
            </div>
            <div className={classes.info}>
              <strong>Address</strong>
              {order.address}
            </div>
            <div className={classes.info}>
              <strong>State</strong>
              <span className={classes.status}>{order.status}</span>
            </div>
            <div className={classes.info}>
              <strong>Food Status</strong>
              <span className={`${classes.status} ${order.foodStatus === 'READY FOR PICKUP' ? classes.ready : ''}`}>
                {order.foodStatus}
              </span>
            </div>

            {order.foodStatus === 'READY FOR PICKUP' && (
              <div className={classes.foodStatusButton}>
                <button onClick={handleFoodStatusUpdate}>Mark as Picked Up</button>
              </div>
            )}

            {order.paymentId && (
              <div className={classes.info}>
                <strong>Payment ID</strong>
                {order.paymentId}
              </div>
            )}
          </div>

          <OrderItemsList order={order} />

          {order.status === 'NEW' && (
            <div className={classes.payment}>
              <Link to="/payment">Go To Payment</Link>
            </div>
          )}
        </div>

        {order.status === 'DELIVERED' && order.location && (
          <div className={classes.mapContainer}>
            <Map location={order.location} />
          </div>
        )}

        {/* Rating Modal */}
        {isRatingOpen && (
          <Modal onClose={() => setIsRatingOpen(false)}>
            <h2>Rate Your Food</h2>
            <StarRating value={rating} onChange={setRating} />
            <button onClick={handleRatingSubmit}>Submit</button>
          </Modal>
        )}

        {/* Thank You Message */}
        {isThankYouVisible && (
          <div className={classes.thankYouMessage}>
            <p>Thank you for your feedback!</p>
          </div>
        )}
      </div>
    )
  );
}
