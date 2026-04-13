🍬 Prem Mithas – Digital Sweet Shop (Full-Stack MERN)A premium full-stack e-commerce platform tailored for a traditional sweet shop business.The platform features a high-performance customer storefront, a data-driven admin dashboard, and a secure backend API with integrated AI-driven recommendations and multiple payment gateways.

🌐 Live ModulesFrontend (Customer Store) – Responsive UI for browsing sweets, custom box building, and order tracking.
Admin Panel – Comprehensive management of inventory, sales insights, and coupons.
Backend API – Centralized REST API for authentication, database logic, and media handling.

🧩 Project StructurePlaintextPREM-MITHAS/
├── frontend/     → Customer-facing website (React + Vite + Tailwind)
├── admin/        → Management dashboard (React + Shadcn UI)
├── backend/      → REST API (Node.js + Express + MongoDB)
└── sweets/       → Project assets and documentation

🚀 Tech Stack🖥️ Frontend & AdminReact.js (Vite)Tailwind CSSContext API (ShopContext & NotificationContext)Lucide React (Icons)Shadcn UI & Radix UI (Admin Interface)Axios (API Requests)
⚙️ BackendNode.js & Express.jsMongoDB + MongooseJWT AuthenticationCloudinary (Product Image Hosting)Nodemailer (Email Notifications)Multer (File Handling)
🧑‍💻 Core Features
👤 Advanced User FeaturesAI Recommendations: Personalized sweet suggestions based on browsing.
Sweet Box Builder: Interactive tool to create custom assorted boxes.
QR Quick Order: Instant ordering via QR code integration.Order Tracking: 
Real-time visualization of delivery status.
Automated Invoices: PDF invoice generation for every purchase.
🧑‍💼 Professional Admin ToolsSales Insights: Graphical data overview of shop performance.
Coupon Management: System to create and track discount codes.
Inventory Control: Full CRUD operations for products with category tagging.
Review Management: Moderation of customer feedback and ratings.
🔐 Authentication & SecurityRole-based Access Control (Admin vs. User).
Secure password hashing using Bcrypt.
JWT-based session management with protected API routes.
Backend verification for all UPI and Card payments.

🗂️ Environment VariablesBackend (backend/.env)Code snippetPORT=4000

MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

ADMIN_EMAIL=admin@premmithas.com
ADMIN_PASSWORD=secure_password
▶️ Getting Started

1️⃣ InstallationBash# Install dependencies for all modules
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install

2️⃣ Running LocallyBash# Start Backend (Port 4000)
cd backend && npm start

# Start Frontend (Port 5173)
cd frontend && npm run dev

# Start Admin (Port 5174)
cd admin && npm run dev

📡 Key API EndpointsMethodEndpointDescription
POST/api/user/loginUser/Admin Authentication
GET/api/product/listFetch all sweets
POST/api/order/placeProcess new orders
POST/api/coupon/create(Admin) Generate discount codes
GET/api/review/product/:idFetch product reviews

🧪 Payments Supported
✅ Cash on Delivery (COD)
✅ UPI Payments (with Modal Integration)
✅ Stripe / Razorpay (Ready for Card Payments)


👤 Author
Shaily Rinait📧 Email: shailyrinait0000@gmail.com🔗 
GitHub: @Shaily384
