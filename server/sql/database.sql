create TABLE user
(
    id        SERIAL PRIMARY KEY,
    username  VARCHAR(255),
    firstName VARCHAR(255),
    lastName  VARCHAR(255),
    email     VARCHAR(255),
    password  VARCHAR(255),
)

create TABLE product
(
    id      SERIAL PRIMARY KEY,
    title    VARCHAR(255),
    price VARCHAR(255)
    stock VARCHAR(255)
    timestamps VARCHAR(255)
)
create TABLE order
(
    id SERIAL PRIMARY KEY,
    user_id SERIAL PRIMARY KEY,
    shipping_cost varchar(255),
    created_at varchar(255),
    updated_at varchar(255),
    status varchar(255)
)