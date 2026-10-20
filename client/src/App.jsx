import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import {
  FiArrowDownRight,
  FiArrowRight,
  FiBell,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiMinus,
  FiPlus,
  FiSearch,
  FiShoppingBag,
  FiSliders,
  FiUser,
  FiX,
  FiPackage,
  FiGrid,
  FiEdit2,
  FiTrash2,
  FiPlusCircle,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiSun,
  FiMoon,
} from "react-icons/fi";

import {
  API,
  API_ORIGIN,
  SERVER_ORIGIN,
  imageUrl,
  messageOf,
  unwrapList,
} from "./api";
import hero1 from "./hero-1.jpg";
import hero2 from "./hero-2.jpg";
import hero3 from "./hero-3.jpg";

const AuthContext = createContext(null);
const CartContext = createContext(null);
const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

// Normalize common product field names used by different APIs.
const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getProductTitle = (product = {}) =>
  String(
    firstValue(
      product.title,
      product.name,
      product.productName,
      product.product_name,
      product.productTitle,
      product.product_title,
      product.label,
      product.slug,
    ) || "",
  ).trim();

const getProductImage = (product = {}) => {
  const candidates = [
    product.thumbnail,
    product.image,
    product.images,
    product.imageUrl,
    product.imageURL,
    product.photo,
    product.picture,
    product.productImage,
    product.product_image,
    product.media,
  ];
  for (const candidate of candidates) {
    const value = Array.isArray(candidate) ? candidate[0] : candidate;
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value && typeof value === "object") {
      const nested = firstValue(
        value.url,
        value.src,
        value.path,
        value.filename,
      );
      if (typeof nested === "string" && nested.trim()) return nested.trim();
    }
  }
  return "";
};

const normalizeProduct = (product = {}) => {
  const title = getProductTitle(product);
  const image = getProductImage(product);
  const priceValue = firstValue(
    product.price,
    product.productPrice,
    product.product_price,
    product.amount,
    product.cost,
  );
  return {
    ...product,
    title: title && title.toLowerCase() !== "title" ? title : "",
    price: Number(priceValue) || 0,
    thumbnail: image,
    _id: firstValue(
      product._id,
      product.id,
      product.productId,
      product.product_id,
    ),
  };
};

const sampleProducts = [
  {
    _id: "sample1",
    title: "Studio ceramic vase",
    category: "Home",
    price: 42,
    description:
      "A sculptural ceramic piece made for slow mornings and thoughtful spaces.",
    thumbnail:
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=900&q=85",
    rating: 4.8,
    stock: 12,
  },
  {
    _id: "sample2",
    title: "Everyday carry tote",
    category: "Accessories",
    price: 36,
    description:
      "A sturdy, beautifully simple tote for wherever the day takes you.",
    thumbnail:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=85",
    rating: 4.7,
    stock: 18,
  },
  {
    _id: "sample3",
    title: "Minimal wristwatch",
    category: "Accessories",
    price: 89,
    description:
      "Clean lines, considered materials, and a timeless everyday silhouette.",
    thumbnail:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85",
    rating: 4.9,
    stock: 8,
  },
  {
    _id: "sample4",
    title: "Soft knit throw",
    category: "Home",
    price: 58,
    description: "A cozy textured layer for your favorite corner of the house.",
    thumbnail:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=85",
    rating: 4.6,
    stock: 15,
  },
  {
    _id: "sample5",
    title: "Daily skincare set",
    category: "Wellness",
    price: 48,
    description: "A pared-back daily ritual with thoughtful essentials.",
    thumbnail:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=900&q=85",
    rating: 4.8,
    stock: 20,
  },
  {
    _id: "sample6",
    title: "Glass carafe set",
    category: "Home",
    price: 32,
    description:
      "A clear, elegant set for daily rituals and dinner with friends.",
    thumbnail:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&q=85",
    rating: 4.5,
    stock: 10,
  },
  {
    _id: "sample7",
    title: "Canvas weekend bag",
    category: "Accessories",
    price: 74,
    description:
      "Lightweight, roomy, and ready for a spontaneous weekend away.",
    thumbnail:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85",
    rating: 4.7,
    stock: 6,
  },
  {
    _id: "sample8",
    title: "Scented candle",
    category: "Wellness",
    price: 24,
    description:
      "Warm cedar and soft citrus to bring a little calm to the everyday.",
    thumbnail:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=900&q=85",
    rating: 4.6,
    stock: 30,
  },
];
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("forma_user"));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("forma_token"));
  const [loading, setLoading] = useState(true);
  const logout = useCallback(() => {
    localStorage.removeItem("forma_token");
    localStorage.removeItem("forma_user");
    setToken(null);
    setUser(null);
  }, []);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await API.get("/auth/me");
        if (!active) return;
        const current = data.user || data;
        setUser(current);
        localStorage.setItem("forma_user", JSON.stringify(current));
      } catch {
        logout();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    const t = data.token || data.accessToken;
    if (!t)
      throw new Error("Login succeeded but the API did not return a token.");
    localStorage.setItem("forma_token", t);
    setToken(t);
    try {
      const { data: me } = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const u = me.user || me;
      localStorage.setItem("forma_user", JSON.stringify(u));
      setUser(u);
    } catch {
      const u = data.user || { email };
      localStorage.setItem("forma_user", JSON.stringify(u));
      setUser(u);
    }
    return data;
  };
  const value = useMemo(
    () => ({ user, token, loading, login, logout, setUser }),
    [user, token, loading, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("forma_cart")) || [];
    } catch {
      return [];
    }
  });
  useEffect(
    () => localStorage.setItem("forma_cart", JSON.stringify(items)),
    [items],
  );
  const add = (p, quantity = 1) => {
    setItems((old) => {
      const found = old.find((i) => i.product._id === p._id);
      return found
        ? old.map((i) =>
            i.product._id === p._id
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          )
        : [...old, { product: p, quantity }];
    });
    toast.success("Added to your bag");
  };
  const remove = (id) =>
    setItems((old) => old.filter((i) => i.product._id !== id));
  const update = (id, q) =>
    setItems((old) =>
      old.map((i) =>
        i.product._id === id ? { ...i, quantity: Math.max(1, q) } : i,
      ),
    );
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce(
    (s, i) => s + (Number(i.product.price) || 0) * i.quantity,
    0,
  );
  return (
    <CartContext.Provider
      value={{ items, add, remove, update, clear, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}
const useAuth = () => useContext(AuthContext);
const useCart = () => useContext(CartContext);
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Shell />
      </CartProvider>
    </AuthProvider>
  );
}
function Shell() {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [mobile, setMobile] = useState(false);
  const [noticeCount, setNoticeCount] = useState(0);

  // Theme state persisted in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("forma_theme") || "light";
  });

  const cart = useCart();
  const nav = useNavigate();

  // Apply data-theme attribute on mount and theme state change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("forma_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const storageKey = `forma_read_count_${user?._id || "guest"}`;

  useEffect(() => {
    if (!token) return;

    // Fetch initial notifications and compare against stored read count
    API.get("/notifications/me")
      .then((r) => {
        const list = unwrapList(r.data, ["notifications"]);
        const readCount = Number(localStorage.getItem(storageKey)) || 0;

        // Calculate unread items as total items minus read items
        const unread = Math.max(0, list.length - readCount);
        setNoticeCount(unread);
      })
      .catch(() => {});

    // Real-time WebSocket listener
    let socket;
    try {
      socket = io(API_ORIGIN.replace(/\/api$/, ""), {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        if (user?._id) socket.emit("join", user._id);
      });

      socket.on("notification", (n) => {
        setNoticeCount((prev) => prev + 1);
        toast(n?.message || "You have a new notification", { icon: "✨" });
      });
    } catch {}

    return () => socket?.disconnect();
  }, [token, user?._id, storageKey]);

  // Handler triggered when clicking the Bell icon or visiting /notifications
  const handleMarkAsRead = () => {
    setNoticeCount(0);

    // Save total length of current notification list into localStorage
    API.get("/notifications/me")
      .then((r) => {
        const list = unwrapList(r.data, ["notifications"]);
        localStorage.setItem(storageKey, String(list.length));
      })
      .catch(() => {});

    API.patch("/notifications/read").catch(() => {});
  };

  const doSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      nav(`/shop?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="app-container">
      <div className="announcement">
        <span>A little more considered. A little more you.</span>
        <span className="announcement-highlight">
          Complimentary shipping on orders over $100
        </span>
      </div>

      <header className="header">
        <Link className="brand" to="/">
          <span className="brand-mark">f.</span>
          <span className="brand-text">
            forma<span className="brand-dot">.</span>
          </span>
        </Link>

        <button
          className="icon-btn mobile-toggle"
          onClick={() => setMobile(!mobile)}
          aria-label="Toggle menu"
        >
          {mobile ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`main-nav ${mobile ? "is-open" : ""}`}>
          <NavLink
            to="/shop"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Shop All
          </NavLink>
          <a href="/#collections">Collections</a>
          <a href="/#story">Our Story</a>
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "active admin-nav-link" : "admin-nav-link"
              }
            >
              <FiGrid className="nav-icon" /> Admin Studio
            </NavLink>
          )}
        </nav>

        <form className="nav-search" onSubmit={doSearch}>
          <FiSearch className="search-icon" />
          <input
            placeholder="Search essentials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd>↵</kbd>
        </form>

        <div className="header-actions">
          {/* Night Mode Toggle Button */}
          <button
            className="icon-btn theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            type="button"
          >
            {theme === "light" ? <FiMoon /> : <FiSun />}
          </button>

          <Link
            to={user ? "/profile" : "/login"}
            className="icon-btn"
            aria-label="Account"
            title={user ? user.email : "Sign in"}
          >
            <FiUser />
          </Link>

          {user && (
            <Link
              to="/notifications"
              className="icon-btn notification-btn"
              aria-label="Notifications"
              onClick={handleMarkAsRead}
            >
              <FiBell />
              {noticeCount > 0 && <i className="badge">{noticeCount}</i>}
            </Link>
          )}

          <Link to="/cart" className="bag-btn">
            <FiShoppingBag />
            <span className="bag-label">Bag</span>
            <b className="bag-count">{cart.count}</b>
          </Link>

          {user && (
            <button
              className="icon-btn logout-btn"
              onClick={() => {
                logout();
                toast.success("Signed out");
              }}
              title="Sign out"
            >
              <FiLogOut />
            </button>
          )}
        </div>
      </header>

      {mobile && (
        <div className="mobile-scrim" onClick={() => setMobile(false)} />
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/success" element={<PaymentResult success />} />
          <Route path="/orders/cancel" element={<PaymentResult />} />
          <Route
            path="/notifications"
            element={<NotificationsPage onRead={handleMarkAsRead} />}
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
function SectionTitle({ eyebrow, title, sub, action }) {
  return (
    <div className="section-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    API.get("/products", {
      params: { page: 1, pageSize: 50, sortBy: "createdAt", order: "desc" },
    })
      .then((r) => {
        if (ok)
          setProducts(
            (unwrapList(r.data).length
              ? unwrapList(r.data)
              : sampleProducts
            ).map(normalizeProduct),
          );
      })
      .catch(() => {
        if (ok) setProducts(sampleProducts.map(normalizeProduct));
      })
      .finally(() => ok && setLoading(false));
    return () => {
      ok = false;
    };
  }, []);

  // Find real product images for each category, or fallback to hero assets
  const homeProd = products.find((p) => p.category === "Home" && p.thumbnail);
  const accProd = products.find(
    (p) => p.category === "Accessories" && p.thumbnail,
  );
  const wellProd = products.find(
    (p) => (p.category === "Wellness" || p.category === "Food") && p.thumbnail,
  );

  const homeImg = homeProd ? imageUrl(homeProd.thumbnail) : hero3;
  const accImg = accProd ? imageUrl(accProd.thumbnail) : hero2;
  const wellImg = wellProd ? imageUrl(wellProd.thumbnail) : hero1;

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow light">THE EVERYDAY EDIT · VOL. 01</p>
          <h1>
            Good things.
            <br />
            <em>Better living.</em>
          </h1>
          <p className="hero-sub">
            Thoughtful objects for the spaces you make, the days you live, and
            everything in between.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-light" to="/shop">
              Explore the collection <FiArrowRight />
            </Link>
            <a className="text-link light-link" href="#story">
              Our point of view <FiArrowDownRight />
            </a>
          </div>
          <div className="hero-foot">
            <span>01 — 03</span>
            <span className="hero-line" />
            <span>Designed for daily life</span>
          </div>
        </div>
        <div className="hero-visual">
          <div
            className="hero-image hero-image-main"
            style={{
              backgroundImage: `url(${hero1})`,
            }}
          />
          <div
            className="hero-image hero-image-small"
            style={{
              backgroundImage: `url(${hero2})`,
            }}
          />
          <div className="hero-note">
            <span>THE SMALL THINGS</span>
            <strong>Make a difference.</strong>
          </div>
          <div className="hero-stamp">
            FORM
            <br />
            FOLLOWS
            <br />
            FEELING
          </div>
        </div>
      </section>

      <div className="trust-strip">
        <div>
          <span>✳</span> Thoughtfully sourced
        </div>
        <div>
          <span>↗</span> Made to be kept
        </div>
        <div>
          <span>♡</span> Everyday favorites
        </div>
        <div>
          <span>◉</span> Secure checkout
        </div>
      </div>

      <section className="section page-wrap" id="collections">
        <SectionTitle
          eyebrow="A GOOD PLACE TO START"
          title="Find your kind of everyday."
          sub="A few considered categories, endless ways to make them yours."
        />
        <div className="category-grid">
          <Link
            to="/shop?category=Home"
            className="category-card category-home"
            style={{
              backgroundImage: `linear-gradient(0deg,rgba(26,32,25,.58),transparent 75%),url(${homeImg})`,
            }}
          >
            <span>01 / HOME</span>
            <h3>
              Make room
              <br />
              for living.
            </h3>
            <b>
              Explore home <FiArrowRight />
            </b>
          </Link>

          <Link
            to="/shop?category=Accessories"
            className="category-card category-accessories"
            style={{
              backgroundImage: `linear-gradient(0deg,rgba(26,32,25,.58),transparent 75%),url(${accImg})`,
            }}
          >
            <span>02 / ACCESSORIES</span>
            <h3>
              Little details.
              <br />
              Big feeling.
            </h3>
            <b>
              Find your extra <FiArrowRight />
            </b>
          </Link>

          <Link
            to="/shop?category=Wellness"
            className="category-card category-wellness"
            style={{
              backgroundImage: `linear-gradient(0deg,rgba(26,32,25,.58),transparent 75%),url(${wellImg})`,
            }}
          >
            <span>03 / WELLNESS & FOOD</span>
            <h3>
              Come back
              <br />
              to yourself.
            </h3>
            <b>
              Take a moment <FiArrowRight />
            </b>
          </Link>
        </div>
      </section>

      <section className="section page-wrap products-section">
        <SectionTitle
          eyebrow="THE CURRENT FAVORITES"
          title="Things worth keeping."
          sub="A small edit of things we think you'll love."
          action={
            <Link className="text-link" to="/shop">
              Shop everything <FiArrowRight />
            </Link>
          }
        />
        <ProductGrid products={products.slice(0, 8)} loading={loading} />
      </section>

      <section className="story-band" id="story">
        <div
          className="story-photo"
          style={{ backgroundImage: `url(${hero3})` }}
        />
        <div className="story-copy">
          <p className="eyebrow">A NOTE FROM FORMA</p>
          <h2>
            Less, but with
            <br />
            <em>more meaning.</em>
          </h2>
          <p>
            We believe the things around us should earn their place. Useful,
            beautiful, made for real life. That's the idea behind every piece in
            our edit.
          </p>
          <Link to="/shop" className="btn btn-dark">
            Get to know the edit <FiArrowRight />
          </Link>
          <div className="story-sign">
            The Forma team <span>✳</span>
          </div>
        </div>
      </section>

      <section className="newsletter page-wrap">
        <div>
          <p className="eyebrow">A LITTLE NOTE, NOW AND THEN</p>
          <h2>Good things in your inbox.</h2>
          <p className="muted">
            New finds, thoughtful ideas, and the occasional something special.
          </p>
        </div>
        <Newsletter />
      </section>
    </>
  );
}
function Newsletter() {
  const [email, setEmail] = useState("");
  return (
    <form
      className="newsletter-form"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("You’re on the list — thank you!");
        setEmail("");
      }}
    >
      <input
        type="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button aria-label="Subscribe">
        <FiArrowRight />
      </button>
      <small>By subscribing, you agree to receive occasional updates.</small>
    </form>
  );
}
function ProductGrid({ products, loading }) {
  if (loading)
    return (
      <div className="product-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
    );
  if (!products.length)
    return (
      <div className="empty-state">
        <FiPackage />
        <h3>Nothing here just yet</h3>
        <p>Try another search or explore the full collection.</p>
      </div>
    );
  return (
    <div className="product-grid">
      {products.map((rawProduct, i) => {
        const product = normalizeProduct(rawProduct);
        return (
          <ProductCard
            key={product._id || product.id || i}
            product={product}
            index={i}
          />
        );
      })}
    </div>
  );
}
function ProductCard({ product: rawProduct, index = 0 }) {
  const product = normalizeProduct(rawProduct);
  const { add } = useCart();
  const [liked, setLiked] = useState(false);
  const productId = product._id || product.id;
  const title = product.title || "Product name unavailable";
  const image = product.thumbnail;
  return (
    <article className="product-card">
      <Link
        className={`product-image-wrap ${image ? "" : "image-unavailable"}`}
        to={productId ? `/product/${productId}` : "/shop"}
        aria-label={`View ${title}`}
      >
        {image ? (
          <img
            src={imageUrl(image)}
            alt={title}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.parentElement.classList.add(
                "image-unavailable",
              );
            }}
          />
        ) : (
          <div
            className="product-image-placeholder"
            role="img"
            aria-label="No product image"
            style={{
              minHeight: 260,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#eeece6",
              color: "#77766f",
            }}
          >
            <FiPackage size={28} />
            <span>Image unavailable</span>
          </div>
        )}
        <span className="product-tag">
          {index % 3 === 0 ? "FORMA PICK" : product.category || "THE EDIT"}
        </span>
      </Link>
      <button
        className={`heart-btn ${liked ? "liked" : ""}`}
        onClick={() => setLiked((value) => !value)}
        aria-label={liked ? "Remove from saved products" : "Save product"}
        type="button"
      >
        <FiHeart />
      </button>
      <div className="product-info">
        <Link
          to={productId ? `/product/${productId}` : "/shop"}
          className="product-name"
        >
          {title}
        </Link>
        <p className="product-category">
          {product.category || "Everyday essentials"}
        </p>
        <div className="product-bottom">
          <strong>{money(product.price)}</strong>
          <button
            className="add-mini"
            onClick={() => add(product)}
            aria-label={`Add ${title} to bag`}
            type="button"
            disabled={!productId}
          >
            <FiPlus />
          </button>
        </div>
      </div>
    </article>
  );
}
function Shop() {
  const [params, setParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState(params.get("category") || "");
  const [search, setSearch] = useState(params.get("search") || "");
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    setCategory(params.get("category") || "");
    setSearch(params.get("search") || "");
    setPage(1);
  }, [params]);

  useEffect(() => {
    let live = true;
    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        // Fetch the catalog without relying on the server to sort/filter it.
        const { data } = await API.get("/products", {
          params: { page: 1, limit: 1000, pageSize: 1000 },
        });
        if (!live) return;
        let list = unwrapList(data);
        if (!list.length && Array.isArray(data?.data)) list = data.data;
        if (!list.length && Array.isArray(data?.data?.products))
          list = data.data.products;
        if (!list.length && Array.isArray(data?.result)) list = data.result;
        if (!list.length && Array.isArray(data?.products)) list = data.products;
        setAllProducts(list.map(normalizeProduct));
        if (!list.length)
          setError(
            "The API returned no products. Check that products exist in your database.",
          );
      } catch (err) {
        if (!live) return;
        setAllProducts([]);
        setError(messageOf(err) || "Could not load products from the API.");
      } finally {
        if (live) setLoading(false);
      }
    }
    loadProducts();
    return () => {
      live = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];
    const query = search.trim().toLowerCase();
    if (query)
      list = list.filter((p) =>
        String(p.title || p.name || p.productName || p.product_name || "")
          .toLowerCase()
          .includes(query),
      );
    if (category)
      list = list.filter(
        (p) =>
          String(p.category || "").toLowerCase() === category.toLowerCase(),
      );
    if (minPrice !== "")
      list = list.filter((p) => Number(p.price) >= Number(minPrice));
    if (maxPrice !== "")
      list = list.filter((p) => Number(p.price) <= Number(maxPrice));
    if (sort === "price-low")
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (sort === "price-high")
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    else
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
    return list;
  }, [allProducts, search, category, minPrice, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="page-wrap shop-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <FiChevronRight /> Shop all
      </div>
      <div className="shop-heading">
        <div>
          <p className="eyebrow">THE FULL EDIT</p>
          <h1>
            Shop all <em>good things.</em>
          </h1>
          <p className="muted">Objects with purpose. Details with feeling.</p>
        </div>
        <div className="shop-count">
          {loading
            ? "Finding your favorites…"
            : `${filteredProducts.length} pieces to explore`}
        </div>
      </div>
      {error && <div className="inline-note">{error}</div>}
      <div className="shop-toolbar">
        <button
          className="filter-toggle"
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <FiSliders /> Filters <FiChevronDown />
        </button>
        <div className="active-filter">
          {category && (
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setPage(1);
                const next = new URLSearchParams(params);
                next.delete("category");
                setParams(next);
              }}
            >
              {category} <FiX />
            </button>
          )}
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
                const next = new URLSearchParams(params);
                next.delete("search");
                setParams(next);
              }}
            >
              “{search}” <FiX />
            </button>
          )}
        </div>
        <label className="sort-select">
          Sort by{" "}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Just in</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className={`shop-layout ${filtersOpen ? "filters-open" : ""}`}>
        <aside className="filter-panel">
          <div className="filter-title">
            Categories{" "}
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setMinPrice("");
                setMaxPrice("");
                setPage(1);
                const next = new URLSearchParams(params);
                next.delete("category");
                setParams(next);
              }}
            >
              Clear
            </button>
          </div>
          {["Home", "Accessories", "Wellness", "Food", "Pet Food"].map((c) => (
            <button
              type="button"
              className={`filter-option ${category === c ? "selected" : ""}`}
              key={c}
              onClick={() => {
                const nextCategory = category === c ? "" : c;
                setCategory(nextCategory);
                setPage(1);
                const next = new URLSearchParams(params);
                if (nextCategory) next.set("category", nextCategory);
                else next.delete("category");
                setParams(next);
              }}
            >
              {c}
              <span>{category === c ? "−" : "+"}</span>
            </button>
          ))}
          <div className="filter-divider" />
          <p className="filter-title">Price range</p>
          <div className="price-inputs">
            <input
              type="number"
              min="0"
              placeholder="Min $"
              aria-label="Minimum price"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
            />
            <span>—</span>
            <input
              type="number"
              min="0"
              placeholder="Max $"
              aria-label="Maximum price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-dark filter-apply"
            onClick={() => {
              setPage(1);
              setFiltersOpen(false);
            }}
          >
            Apply filters
          </button>
          <button
            type="button"
            className="text-link clear-price-btn"
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              setPage(1);
            }}
          >
            Clear price range
          </button>
        </aside>
        <div className="shop-results">
          <ProductGrid products={visibleProducts} loading={loading} />
          {!loading && filteredProducts.length > 0 && (
            <div className="pagination">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <FiChevronLeft />
              </button>
              <span>
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductDetail() {
  const productId = useLocation().pathname.split("/").pop();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  useEffect(() => {
    let live = true;
    API.get(`/products/${productId}`)
      .then(
        (r) => live && setProduct(normalizeProduct(r.data.product || r.data)),
      )
      .catch(
        () =>
          live &&
          setProduct(
            normalizeProduct(
              sampleProducts.find((p) => p._id === productId) ||
                sampleProducts[0],
            ),
          ),
      )
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [productId]);
  if (loading)
    return <div className="page-wrap loading-state">Finding your piece…</div>;
  if (!product) return <NotFound />;

  const getProductImages = (product = {}) => {
    const candidates = [
      product.thumbnail,
      product.image,
      product.images,
      product.imageUrl,
      product.photo,
      product.picture,
      product.media,
    ];

    const result = [];

    for (const candidate of candidates) {
      const values = Array.isArray(candidate) ? candidate : [candidate];

      for (const value of values) {
        const path =
          typeof value === "string"
            ? value.trim()
            : value && typeof value === "object"
              ? value.url || value.src || value.path || value.filename
              : "";

        if (path && !result.includes(path)) {
          result.push(path);
        }
      }
    }

    return result;
  };

  const detailImages = getProductImages(product).map(imageUrl);
  const images = [...new Set(detailImages)];
  const detailTitle = getProductTitle(product) || "Product name unavailable";

  const img = images.includes(selectedImage) ? selectedImage : images[0] || "";
  return (
    <div className="page-wrap detail-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <FiChevronRight />
        <Link to="/shop">Shop</Link>
        <FiChevronRight />
        {detailTitle}
      </div>
      <div className="detail-grid">
        <div className="detail-gallery">
          <div className="detail-image">
            {img ? (
              <img
                src={img}
                alt={detailTitle}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="product-image-placeholder">
                <FiPackage size={32} />
                <span>Image unavailable</span>
              </div>
            )}
            <span>THE EVERYDAY EDIT</span>
          </div>

          {images.length > 1 && (
            <div className="detail-thumbnails">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={img === image ? "active" : ""}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt={`${detailTitle} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-copy">
          <p className="eyebrow">{product.category || "A FORMA FAVORITE"}</p>
          <h1>{product.title}</h1>
          <div className="detail-rating">
            ★★★★★ <span>Thoughtfully picked</span>
          </div>
          <div className="detail-price">{money(product.price)}</div>
          <p className="detail-description">
            {product.description ||
              "A thoughtfully selected piece, made to find its place in your everyday."}
          </p>
          <div className="detail-stock">
            {Number(product.stock) > 0 ? (
              <>
                <span className="stock-dot" /> In stock — ready to be yours
              </>
            ) : (
              <span className="out-stock">Currently out of stock</span>
            )}
          </div>
          <div className="purchase-row">
            <div className="quantity-control">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <FiMinus />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>
                <FiPlus />
              </button>
            </div>
            <button
              className="btn btn-dark add-to-bag"
              disabled={Number(product.stock) === 0}
              onClick={() => add(product, qty)}
            >
              Add to bag <FiArrowRight />
            </button>
          </div>
          <div className="detail-perks">
            <div>
              <FiPackage />
              <span>
                <b>Thoughtfully packed</b>
                <small>Made ready for gifting</small>
              </span>
            </div>
            <div>
              <FiTruck />
              <span>
                <b>Complimentary shipping</b>
                <small>On orders over $100</small>
              </span>
            </div>
            <div>
              <FiCheckCircle />
              <span>
                <b>Secure checkout</b>
                <small>Payments powered by Stripe</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function CartPage() {
  const { items, remove, update, subtotal, clear } = useCart();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();
  const checkout = async () => {
    if (!user) {
      toast("Sign in to continue to checkout");
      navigate("/login?next=/cart");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        items: items.map((i) => ({
          product: i.product._id || i.product.id,
          quantity: i.quantity,
        })),
        shippingAddress: address.trim(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };

      const { data } = await API.post("/order", payload);
      if (data.url) {
        // Keep the cart until Stripe confirms the payment.
        window.location.href = data.url;
      } else {
        clear();
        toast.success("Order created");
        navigate("/orders");
      }
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page-wrap cart-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <FiChevronRight /> Your bag
      </div>
      <div className="shop-heading">
        <div>
          <p className="eyebrow">GOOD CHOICES</p>
          <h1>
            Your bag
            <span className="muted">
              {" "}
              ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </h1>
        </div>
        <Link className="text-link" to="/shop">
          Continue shopping <FiArrowRight />
        </Link>
      </div>
      {!items.length ? (
        <div className="empty-state cart-empty">
          <div className="empty-icon">
            <FiShoppingBag />
          </div>
          <h2>Something's missing.</h2>
          <p>Your bag is waiting for a few good things.</p>
          <Link className="btn btn-dark" to="/shop">
            Explore the collection <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-head">
              <span>Item</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>
            {items.map(({ product: p, quantity }) => (
              <div className="cart-item" key={p._id || p.id}>
                <Link
                  to={`/product/${p._id || p.id}`}
                  className="cart-item-image"
                >
                  <img
                    src={
                      getProductImage(p)
                        ? imageUrl(getProductImage(p))
                        : undefined
                    }
                    alt={p.title}
                  />
                </Link>
                <div className="cart-item-copy">
                  <Link to={`/product/${p._id || p.id}`}>
                    {getProductTitle(p) || "Product name unavailable"}
                  </Link>
                  <span>{p.category || "Everyday essentials"}</span>
                  <strong>{money(p.price)}</strong>
                  <button
                    className="remove-link"
                    onClick={() => remove(p._id || p.id)}
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
                <div className="quantity-control">
                  <button onClick={() => update(p._id || p.id, quantity - 1)}>
                    <FiMinus />
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => update(p._id || p.id, quantity + 1)}>
                    <FiPlus />
                  </button>
                </div>
                <strong className="cart-line-total">
                  {money(p.price * quantity)}
                </strong>
              </div>
            ))}
          </div>
          <aside className="order-summary">
            <p className="eyebrow">THE DETAILS</p>
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {subtotal >= 100 ? "Complimentary" : "Calculated at checkout"}
              </span>
            </div>
            <div className="summary-row summary-total">
              <span>Estimated total</span>
              <b>{money(subtotal)}</b>
            </div>
            <p className="summary-note">
              Taxes and shipping are confirmed at checkout.
            </p>
            <label className="field-label">
              Shipping address
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city, postal code"
              />
            </label>
            <label className="field-label">
              Order notes <span className="muted">(optional)</span>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything we should know?"
              />
            </label>
            <button
              className="btn btn-dark checkout-btn"
              disabled={busy}
              onClick={checkout}
            >
              {busy ? "Preparing checkout…" : "Continue to secure checkout"}{" "}
              <FiArrowRight />
            </button>
            <div className="secure-note">
              <FiCheckCircle /> Secure checkout powered by Stripe
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
function AuthLayout({
  eyebrow,
  title,
  sub,
  children,
  asideTitle = "Good things start here.",
  asideText = "A more thoughtful kind of everyday shopping.",
}) {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-inner">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="muted auth-sub">{sub}</p>
          {children}
        </div>
      </div>
      <aside
        className="auth-aside"
        style={{
          backgroundImage: `linear-gradient(0deg,rgba(32,39,31,.7),rgba(32,39,31,.05)),url(${hero2})`,
        }}
      >
        <Link to="/" className="auth-logo">
          forma<span>.</span>
        </Link>
        <div>
          <p className="eyebrow light">A LITTLE MORE CONSIDERED</p>
          <h2>{asideTitle}</h2>
          <p>{asideText}</p>
          <span className="auth-aside-foot">
            Objects for living well. <b>✳</b>
          </span>
        </div>
      </aside>
    </div>
  );
}
function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Good to see you."
      sub="Sign in to pick up where you left off."
    >
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await login(email, password);
            toast.success("Welcome back");
            nav(params.get("next") || "/profile");
          } catch (err) {
            toast.error(messageOf(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field-label">
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field-label">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn-dark form-submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"} <FiArrowRight />
        </button>
      </form>
      <p className="auth-switch">
        New to Forma? <Link to="/register">Create an account</Link>
      </p>
      <p className="form-hint">
        Use the email and password registered with your backend API.
      </p>
    </AuthLayout>
  );
}
function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  return (
    <AuthLayout
      eyebrow="MAKE YOURSELF AT HOME"
      title="A good thing begins."
      sub="Create an account to keep your favorites and orders close."
    >
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const { data } = await API.post("/auth/register", {
              email,
              password,
            });
            sessionStorage.setItem("forma_verify_email", email);
            toast.success(
              data.message || "Check your inbox for a verification code",
            );
            nav("/verify-email");
          } catch (err) {
            toast.error(messageOf(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field-label">
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field-label">
          Password
          <input
            type="password"
            minLength="8"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <p className="form-hint">
          We'll send a verification code to your email address.
        </p>
        <button className="btn btn-dark form-submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"} <FiArrowRight />
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
function VerifyPage() {
  const [email, setEmail] = useState(
    sessionStorage.getItem("forma_verify_email") || "",
  );
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await API.post("/auth/verify-otp", { email, otp });
      toast.success(data.message || "Email verified. You can sign in.");
      nav("/login");
    } catch (err) {
      toast.error(messageOf(err));
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    try {
      const { data } = await API.post("/auth/resend-otp", { email });
      toast.success(data.message || "A new code has been sent");
    } catch (e) {
      toast.error(messageOf(e));
    }
  };
  return (
    <AuthLayout
      eyebrow="ONE QUICK CHECK"
      title="Check your inbox."
      sub="Enter the verification code we sent to your email."
    >
      <form className="form-stack" onSubmit={verify}>
        <label className="field-label">
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field-label">
          Verification code
          <input
            required
            inputMode="numeric"
            maxLength="6"
            placeholder="Enter your OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </label>
        <button className="btn btn-dark form-submit" disabled={busy}>
          {busy ? "Verifying…" : "Verify email"} <FiArrowRight />
        </button>
      </form>
      <p className="auth-switch">
        Didn't get a code?{" "}
        <button className="inline-button" onClick={resend}>
          Send another
        </button>
      </p>
    </AuthLayout>
  );
}
function RequireAuth({ children, admin = false }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading)
    return <div className="page-wrap loading-state">Just a moment…</div>;
  if (!user) return <NavigateLogin to={loc.pathname} />;
  if (admin && user.role !== "admin")
    return (
      <div className="page-wrap empty-state">
        <FiGrid />
        <h2>Admin access only</h2>
        <p>This area is reserved for admin accounts.</p>
        <Link className="btn btn-dark" to="/">
          Back to shop
        </Link>
      </div>
    );
  return children;
}
function NavigateLogin({ to }) {
  const nav = useNavigate();
  useEffect(
    () => nav(`/login?next=${encodeURIComponent(to)}`, { replace: true }),
    [nav, to],
  );
  return <div className="page-wrap loading-state">Redirecting to sign in…</div>;
}
function ProfilePage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    API.get("/order/me")
      .then((r) => setOrders(unwrapList(r.data)))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <RequireAuth>
      <div className="page-wrap profile-page">
        <p className="eyebrow">YOUR FORMA</p>
        <h1>
          Your account<span>.</span>
        </h1>
        <div className="profile-layout">
          <aside className="profile-menu">
            <div className="profile-avatar">
              {(user?.email || "U").slice(0, 1).toUpperCase()}
            </div>
            <h3>{user?.email}</h3>
            <span className="role-chip">{user?.role || "customer"}</span>
            <NavLink to="/profile">
              <FiUser /> Account overview
            </NavLink>
            <NavLink to="/orders">
              <FiPackage /> My orders
            </NavLink>
            <NavLink to="/notifications">
              <FiBell /> Notifications
            </NavLink>
            <button onClick={logout}>
              <FiLogOut /> Sign out
            </button>
          </aside>
          <div className="profile-content">
            <div className="profile-welcome">
              <div>
                <p className="eyebrow">A GOOD PLACE TO PICK UP</p>
                <h2>Welcome back.</h2>
                <p className="muted">
                  Your details and recent orders, all in one place.
                </p>
              </div>
              <Link className="btn btn-outline" to="/shop">
                Explore the shop <FiArrowRight />
              </Link>
            </div>
            <div className="profile-stat-grid">
              <div>
                <span>Account email</span>
                <b>{user?.email || "—"}</b>
              </div>
              <div>
                <span>Account type</span>
                <b>{user?.role || "Customer"}</b>
              </div>
              <div>
                <span>Orders placed</span>
                <b>{orders.length}</b>
              </div>
            </div>
            <SectionTitle
              eyebrow="THE LATEST"
              title="Recent orders"
              action={
                <Link className="text-link" to="/orders">
                  View all <FiArrowRight />
                </Link>
              }
            />
            {loading ? (
              <p className="muted">Loading orders…</p>
            ) : orders.length ? (
              <OrderList orders={orders.slice(0, 3)} />
            ) : (
              <div className="empty-inline">
                <FiPackage />
                <div>
                  <b>No orders just yet</b>
                  <p className="muted">Your next favorite thing is waiting.</p>
                </div>
                <Link to="/shop">
                  Start exploring <FiArrowRight />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
function OrderList({ orders, onStatusChange }) {
  const { user } = useAuth();

  return (
    <div className="order-list">
      {orders.map((o) => (
        <div className="order-row" key={o._id}>
          <div className="order-icon">
            <FiPackage />
          </div>
          <div className="order-main">
            <b>Order #{String(o._id).slice(-7).toUpperCase()}</b>
            <span>
              {new Date(o.createdAt || Date.now()).toLocaleDateString()} ·{" "}
              {o.items?.length || 0} items
            </span>
          </div>

          {user?.role === "admin" && onStatusChange ? (
            <select
              value={o.status || "pending"}
              onChange={(e) => onStatusChange(o, e.target.value)}
              className="status-select"
            >
              <option value="pending">pending</option>
              <option value="processed">processed</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
              <option value="canceled">canceled</option>
            </select>
          ) : (
            <span
              className={`status-pill status-${String(o.status || "pending").toLowerCase()}`}
            >
              {o.status || "pending"}
            </span>
          )}

          <strong className="order-amount">{money(o.totalAmount)}</strong>
        </div>
      ))}
    </div>
  );
}
function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const endpoint = user?.role === "admin" ? "/order" : "/order/me";

    API.get(endpoint)
      .then((r) => setOrders(unwrapList(r.data, ["orders"])))
      .catch((e) => toast.error(messageOf(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.role]);

  const handleStatusChange = async (order, newStatus) => {
    try {
      await API.patch(`/order/${order._id}/status`, { status: newStatus });
      toast.success("Order status updated");
      fetchOrders();
    } catch (e) {
      toast.error(messageOf(e));
    }
  };

  const query = orderSearch.trim().toLowerCase();
  const filteredOrders = query
    ? orders.filter((o) => {
        const id = String(o._id || o.id || "").toLowerCase();
        const addr = String(o.shippingAddress || "").toLowerCase();
        return id.includes(query) || addr.includes(query);
      })
    : orders;

  return (
    <RequireAuth>
      <div className="page-wrap orders-page">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p className="eyebrow">
              {user?.role === "admin" ? "STORE MANAGEMENT" : "THE PAPER TRAIL"}
            </p>
            <h1>
              {user?.role === "admin" ? "All customer orders" : "Your orders"}
              <span>.</span>
            </h1>
            <p className="muted">
              {user?.role === "admin"
                ? "Manage and update status for all customer orders across the platform."
                : "Every good thing you've brought home."}
            </p>
          </div>

          <div
            className="nav-search"
            style={{ maxWidth: "280px", width: "100%" }}
          >
            <FiSearch />
            <input
              placeholder="Search by Order ID..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
            />
            {orderSearch && (
              <button
                type="button"
                onClick={() => setOrderSearch("")}
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  padding: "0 8px",
                }}
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p>Loading orders…</p>
        ) : filteredOrders.length ? (
          <OrderList
            orders={filteredOrders}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="empty-state">
            <FiPackage />
            <h2>No orders found.</h2>
            <p>
              {orderSearch
                ? "No order matches your search."
                : "Once orders are placed, they will appear here."}
            </p>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
function PaymentResult({ success = false }) {
  const [params] = useSearchParams();
  const { clear } = useCart();

  useEffect(() => {
    if (success) {
      clear();
    }
  }, [success, clear]);

  return (
    <div className="page-wrap result-page">
      <div className={`result-icon ${success ? "success" : ""}`}>
        {success ? <FiCheck /> : <FiShoppingBag />}
      </div>

      <p className="eyebrow">{success ? "CHECKOUT COMPLETE" : "NO WORRIES"}</p>

      <h1>
        {success ? "A good thing is on its way." : "Still thinking it over?"}
      </h1>

      <p className="muted">
        {success
          ? "Thanks for your order. Payment confirmation and order updates will appear in your account."
          : "Your bag is still here when you’re ready. If you left Checkout, no payment may have been completed."}
      </p>

      <div className="result-actions">
        <Link className="btn btn-dark" to={success ? "/orders" : "/cart"}>
          {success ? "View your orders" : "Return to your bag"} <FiArrowRight />
        </Link>

        <Link className="text-link" to="/shop">
          Keep exploring
        </Link>
      </div>
    </div>
  );
}

function NotificationsPage({ onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/notifications/me")
      .then((r) => {
        setNotifications(unwrapList(r.data, ["notifications"]));
        // Call onRead callback to clear header badge counter
        if (onRead) onRead();
      })
      .catch((e) => toast.error(messageOf(e)))
      .finally(() => setLoading(false));
  }, [onRead]);

  return (
    <RequireAuth>
      <div className="page-wrap notifications-page">
        <p className="eyebrow">A LITTLE HEADS-UP</p>
        <h1>
          Notifications<span>.</span>
        </h1>
        <p className="muted">
          Order updates and notes from Forma, all in one place.
        </p>

        {loading ? (
          <p className="muted">Loading notifications…</p>
        ) : notifications.length ? (
          <div className="notification-list">
            {notifications.map((n, i) => (
              <div className="notification-row" key={n._id || i}>
                <div className="notification-icon">
                  <FiBell />
                </div>
                <div>
                  <b>{n.title || n.type || "A note from Forma"}</b>
                  <p>{n.message || n.body || "You have a new notification."}</p>
                  <small>
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleString()
                      : "Recently"}
                  </small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiBell />
            <h2>All caught up.</h2>
            <p>When there's something to share, you'll find it here.</p>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
function AdminPage() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Home",
    price: "",
    stock: "",
    rating: "0",
    thumbnail: "",
    images: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    setLoading(true);
    Promise.all([
      API.get("/products", { params: { page: 1, pageSize: 100 } })
        .then((r) => setProducts(unwrapList(r.data)))
        .catch(() => setProducts([])),
      API.get("/order", { params: { q: orderSearch.trim() || undefined } })
        .then((r) => setOrders(unwrapList(r.data, ["orders"])))
        .catch(() => setOrders([])),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, [orderSearch]);

  const reset = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      category: "Home",
      price: "",
      stock: "",
      rating: "0",
      thumbnail: "",
      images: "",
    });
    setThumbnailFile(null);
    setImageFiles([]);
  };

  const startEdit = (p) => {
    setEditing(p._id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      category: p.category || "",
      price: p.price ?? "",
      stock: p.stock ?? "",
      rating: p.rating ?? 0,
      thumbnail: p.thumbnail || "",
      images: (p.image || p.images || []).join("\n"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.category) {
        throw new Error("Choose a category for this product.");
      }
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        rating: Number(form.rating),
      };

      if (editing) {
        await API.put(`/products/${editing}`, payload);
      } else {
        if (!thumbnailFile)
          throw new Error("Choose a thumbnail image to create a product.");
        const body = new FormData();
        Object.entries(payload).forEach(([key, value]) =>
          body.append(key, String(value)),
        );
        body.append("thumbnail", thumbnailFile);
        imageFiles.forEach((file) => body.append("images", file));
        await API.post("/products", body);
      }
      toast.success(editing ? "Product updated" : "Product created");
      reset();
      refresh();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setSaving(false);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete “${p.title}”?`)) return;
    try {
      await API.delete(`/products/${p._id}`);
      toast.success("Product deleted");
      refresh();
    } catch (e) {
      toast.error(messageOf(e));
    }
  };

  const changeStatus = async (o, status) => {
    try {
      await API.patch(`/order/${o._id}/status`, { status });
      toast.success("Order status updated");
      refresh();
    } catch (e) {
      toast.error(messageOf(e));
    }
  };

  // Filter local orders by ID or address as fallback
  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim()) return orders;
    const term = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const id = String(o._id || o.id || "").toLowerCase();
      const addr = String(o.shippingAddress || "").toLowerCase();
      return id.includes(term) || addr.includes(term);
    });
  }, [orders, orderSearch]);

  return (
    <RequireAuth admin>
      <div className="page-wrap admin-page">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">THE BACK OFFICE</p>
            <h1>
              Admin studio<span>.</span>
            </h1>
            <p className="muted">
              Your store, from the other side of the counter.
            </p>
          </div>
          <button className="btn btn-outline" onClick={refresh}>
            <FiClock /> Refresh data
          </button>
        </div>

        <div className="admin-stats">
          <div>
            <span>Products in catalog</span>
            <b>{products.length}</b>
            <FiPackage />
          </div>
          <div>
            <span>Orders received</span>
            <b>{orders.length}</b>
            <FiShoppingBag />
          </div>
          <div>
            <span>Order value</span>
            <b>
              {money(
                orders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0),
              )}
            </b>
            <FiGrid />
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={tab === "products" ? "active" : ""}
            onClick={() => setTab("products")}
          >
            <FiPackage /> Products
          </button>
          <button
            className={tab === "orders" ? "active" : ""}
            onClick={() => setTab("orders")}
          >
            <FiShoppingBag /> Orders
          </button>
        </div>

        {tab === "products" ? (
          <div className="admin-products">
            <form className="admin-form" onSubmit={submit}>
              <div className="admin-form-heading">
                <div>
                  <p className="eyebrow">
                    {editing ? "MAKE IT RIGHT" : "ADD SOMETHING GOOD"}
                  </p>
                  <h2>{editing ? "Edit product" : "New product"}</h2>
                </div>
                {editing && (
                  <button type="button" className="icon-btn" onClick={reset}>
                    <FiX />
                  </button>
                )}
              </div>

              <label className="field-label">
                Product title
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>

              <label className="field-label">
                Description
                <textarea
                  required
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>

              <label className="field-label">
                Category
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Choose a category
                  </option>
                  <option value="Home">Home</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Food">Food</option>
                  <option value="Pet Food">Pet Food</option>
                </select>
              </label>

              <div className="form-two-col">
                <label className="field-label">
                  Price (USD)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </label>
                <label className="field-label">
                  Stock
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />
                </label>
              </div>

              {!editing && (
                <>
                  <label className="field-label">
                    Thumbnail image
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) =>
                        setThumbnailFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                  <label className="field-label">
                    Additional images <span className="muted">(up to 5)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setImageFiles(
                          Array.from(e.target.files || []).slice(0, 5),
                        )
                      }
                    />
                  </label>
                </>
              )}

              <label className="field-label">
                Rating
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                />
              </label>

              <button className="btn btn-dark form-submit" disabled={saving}>
                {saving
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Create product"}{" "}
                <FiArrowRight />
              </button>
            </form>

            <div className="admin-table-wrap">
              <div className="admin-table-title">
                <h2>Product catalog</h2>
                <span>{products.length} items</span>
              </div>
              {loading ? (
                <p>Loading products…</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className="table-product">
                            <img src={imageUrl(p.thumbnail)} alt="" />
                            <span>{p.title}</span>
                          </div>
                        </td>
                        <td>{p.category || "Unassigned"}</td>
                        <td>{money(p.price)}</td>
                        <td>{p.stock}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() => startEdit(p)}
                              aria-label="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button onClick={() => del(p)} aria-label="Delete">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <div
              className="admin-table-title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2>Orders</h2>
                <span>{filteredOrders.length} total</span>
              </div>
              <div className="nav-search" style={{ maxWidth: "260px" }}>
                <FiSearch />
                <input
                  placeholder="Search by Order ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
                {orderSearch && (
                  <button
                    type="button"
                    onClick={() => setOrderSearch("")}
                    style={{
                      border: 0,
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <p>Loading orders…</p>
            ) : filteredOrders.length === 0 ? (
              <p className="muted" style={{ padding: "20px 0" }}>
                No orders match your search.
              </p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o._id}>
                      <td style={{ fontWeight: "600" }}>
                        #{String(o._id).toUpperCase()}
                      </td>
                      <td>
                        {new Date(
                          o.createdAt || Date.now(),
                        ).toLocaleDateString()}
                      </td>
                      <td>{money(o.totalAmount)}</td>
                      <td>
                        <span className={`status-pill status-${o.status}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.status || "pending"}
                          onChange={(e) => changeStatus(o, e.target.value)}
                        >
                          <option value="pending">pending</option>
                          <option value="processed">processed</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="canceled">canceled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
function NotFound() {
  return (
    <div className="page-wrap not-found">
      <p className="eyebrow">A LITTLE OFF TRACK</p>
      <h1>
        Nothing here<span>.</span>
      </h1>
      <p className="muted">Looks like this page took a different turn.</p>
      <Link className="btn btn-dark" to="/">
        Back to the good stuff <FiArrowRight />
      </Link>
    </div>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="brand" to="/">
            <span className="brand-mark">f.</span>
            <span>
              forma<span className="brand-dot">.</span>
            </span>
          </Link>
          <p>
            Everyday objects, elevated.
            <br />
            For living well, in your own way.
          </p>
          <div className="social-dots">
            <a href="https://instagram.com" aria-label="Instagram">
              ig
            </a>
            <a href="https://pinterest.com" aria-label="Pinterest">
              p
            </a>
            <a href="https://tiktok.com" aria-label="TikTok">
              tk
            </a>
          </div>
        </div>
        <div className="footer-col">
          <b>Explore</b>
          <Link to="/shop">Shop all</Link>
          <Link to="/shop?category=Home">Home</Link>
          <Link to="/shop?category=Accessories">Accessories</Link>
          <Link to="/shop?category=Food">Food</Link>
          <Link to="/shop?category=Pet Food">Pet Food</Link>
        </div>
        <div className="footer-col">
          <b>Help & info</b>
          <Link to="/profile">Your account</Link>
          <Link to="/orders">Order tracking</Link>
          <a href="mailto:hello@forma.example">Contact us</a>
          <a href="mailto:hello@forma.example">Shipping & returns</a>
        </div>
        <div className="footer-note">
          <span>✳</span>
          <h3>
            Make space
            <br />
            for good things.
          </h3>
          <p>Find a little more meaning in the everyday.</p>
          <Link to="/shop" className="text-link">
            Find your favorite <FiArrowRight />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Forma Studio. Made for everyday.
        </span>
        <div>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Payments secured by Stripe</span>
        </div>
      </div>
    </footer>
  );
}

export default App;
