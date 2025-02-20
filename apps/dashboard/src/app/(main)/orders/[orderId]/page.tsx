import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  // Typography,
} from '@mui/material';

import {
  Attribute,
  AttributeName,
  AttributeValue,
  DeleteRecordButton,
  PageContentContainer,
  PageHeaderActionsContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { deleteOrder, getOrder } from '../_api/orders.server-fn';

async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const { order } = await getOrder(orderId);
  const deleteById = deleteOrder.bind(null, orderId);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Order</PageTitle>
        <PageHeaderActionsContainer>
          {/* <EditRecordLink href={`/products/${orderId}/edit`} /> */}
          <DeleteRecordButton onDelete={deleteById} />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <Attribute>
        <AttributeName>ID</AttributeName>
        <AttributeValue>{order.id}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Ordered at</AttributeName>
        <AttributeValue>
          {new Date(order.createdAt).toLocaleString()}
        </AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Payment status</AttributeName>
        <AttributeValue>{order.payStatus}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Total price</AttributeName>
        <AttributeValue>{order.formattedTotalPrice}</AttributeValue>
      </Attribute>

      <h2>Customer details</h2>
      <Attribute>
        <AttributeName>Registered user</AttributeName>
        <AttributeValue>
          {order.user ? (
            <Link href={`/users/${order.user.id}`}>{order.user.id}</Link>
          ) : (
            'N/A'
          )}
        </AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Name</AttributeName>
        <AttributeValue>{order.customerName}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Email</AttributeName>
        <AttributeValue>{order.email}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Phone</AttributeName>
        <AttributeValue>{order.phone}</AttributeValue>
      </Attribute>

      <h2>Address details</h2>
      <Attribute>
        <AttributeName>Line 1</AttributeName>
        <AttributeValue>{order.address?.line1}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Line 2</AttributeName>
        <AttributeValue>{order.address?.line2}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Country</AttributeName>
        <AttributeValue>{order.address?.country}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>State</AttributeName>
        <AttributeValue>{order.address?.state}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>City</AttributeName>
        <AttributeValue>{order.address?.city}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>ZIP</AttributeName>
        <AttributeValue>{order.address?.postalCode}</AttributeValue>
      </Attribute>

      <h2>Order lines</h2>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Product name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price per unit</TableCell>
              <TableCell>Total price</TableCell>
              <TableCell>Discount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((it) => (
              <TableRow key={it.id}>
                <TableCell>{it.id}</TableCell>
                <TableCell>
                  <Link href={`/skus/${it.productSkuId}`}>
                    {it.productName}
                  </Link>
                </TableCell>
                <TableCell>{it.qty}</TableCell>
                <TableCell>{it.formattedPrice}</TableCell>
                <TableCell>{it.formattedFinalPrice}</TableCell>
                <TableCell>{it.formattedDiscount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PageContentContainer>
  );
}

export default OrderPage;
