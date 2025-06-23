-- CreateIndex
CREATE INDEX `ChatMessage_roomId_idx` ON `ChatMessage`(`roomId`);

-- CreateIndex
CREATE INDEX `ChatMessage_timestamp_idx` ON `ChatMessage`(`timestamp`);

-- CreateIndex
CREATE INDEX `ChatMessage_isRead_idx` ON `ChatMessage`(`isRead`);

-- CreateIndex
CREATE INDEX `ChatMessage_roomId_timestamp_idx` ON `ChatMessage`(`roomId`, `timestamp`);

-- CreateIndex
CREATE INDEX `Order_status_idx` ON `Order`(`status`);

-- CreateIndex
CREATE INDEX `Order_createdAt_idx` ON `Order`(`createdAt`);

-- CreateIndex
CREATE INDEX `Order_userId_status_idx` ON `Order`(`userId`, `status`);

-- CreateIndex
CREATE INDEX `Product_category_idx` ON `Product`(`category`);

-- CreateIndex
CREATE INDEX `Product_price_idx` ON `Product`(`price`);

-- CreateIndex
CREATE INDEX `Product_createdAt_idx` ON `Product`(`createdAt`);

-- CreateIndex
CREATE INDEX `Product_name_idx` ON `Product`(`name`);

-- CreateIndex
CREATE INDEX `Product_category_price_idx` ON `Product`(`category`, `price`);

-- CreateIndex
CREATE FULLTEXT INDEX `Product_name_description_idx` ON `Product`(`name`, `description`);

-- CreateIndex
CREATE INDEX `Review_rating_idx` ON `Review`(`rating`);

-- CreateIndex
CREATE INDEX `Review_createdAt_idx` ON `Review`(`createdAt`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_createdAt_idx` ON `User`(`createdAt`);

-- CreateIndex (these will be created as new indexes since the foreign key indexes don't exist with expected names)
CREATE INDEX `ChatMessage_receiverId_idx` ON `ChatMessage`(`receiverId`);

-- CreateIndex
CREATE INDEX `ChatMessage_senderId_idx` ON `ChatMessage`(`senderId`);

-- CreateIndex
CREATE INDEX `Order_userId_idx` ON `Order`(`userId`);

-- CreateIndex
CREATE INDEX `Review_productId_idx` ON `Review`(`productId`);

-- CreateIndex
CREATE INDEX `Review_userId_idx` ON `Review`(`userId`);
