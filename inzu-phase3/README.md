# Inzu App — Phase 3 Files

## What's in this ZIP

Phase 3 adds three new modules on top of Phases 1 & 2:

| Module | Description |
|---|---|
| 🏢 Real Estate (Buy/Sell) | Full property listings with filters, inquiry system, owner dashboard |
| 🔧 Home Services | Service provider listings, job booking, reviews, real-time status |
| 🛋 Interior Design | Portfolio showcase, designer profiles, design brief request system |

---

## New Files Added

### Server
| File | Purpose |
|---|---|
| `models/RealEstate.js` | Property listing schema (buy/sell) |
| `models/HomeService.js` | Service + ServiceRequest schemas |
| `models/InteriorDesign.js` | InteriorProject + DesignRequest schemas |
| `models/Inquiry.js` | Real estate inquiry schema |
| `controllers/realEstate.controller.js` | CRUD + inquiry + views |
| `controllers/homeService.controller.js` | Services, job requests, reviews |
| `controllers/interiorDesign.controller.js` | Portfolio, design requests |
| `controllers/admin.phase3.js` | Admin approval endpoints (paste into admin.controller.js) |
| `routes/realEstate.routes.js` | `/api/real-estate` |
| `routes/homeService.routes.js` | `/api/services` |
| `routes/interiorDesign.routes.js` | `/api/interior` |
| `server.js` | Updated — registers all Phase 3 routes + user socket rooms |

### Client
| File | Purpose |
|---|---|
| `app/page.jsx` | Updated homepage with all 4 section cards |
| `app/real-estate/page.jsx` | Browse buy/sell listings with filters |
| `app/real-estate/[id]/page.jsx` | Property detail + image gallery + inquiry |
| `app/real-estate/list/page.jsx` | Owner listing form |
| `app/home-services/page.jsx` | Browse services by category/district |
| `app/home-services/[id]/page.jsx` | Service detail + booking form |
| `app/home-services/list/page.jsx` | Provider service listing form |
| `app/interior-design/page.jsx` | Portfolio gallery + designer browser |
| `app/interior-design/[id]/page.jsx` | Project detail with before/after gallery |
| `app/interior-design/request/page.jsx` | Client design brief form |
| `app/dashboard/client/page.jsx` | Unified dashboard (bookings + services + designs) |
| `app/admin/services/page.jsx` | Admin approve services & interior projects |
| `components/Navbar.jsx` | Updated with all 4 nav links |
| `context/SocketContext.jsx` | Updated — joins user room for personal notifications |

---

## How to Integrate with Phase 1 & 2

### Step 1 — Copy server files
Copy these folders into your existing `/server` directory:
- `models/RealEstate.js`
- `models/HomeService.js`
- `models/InteriorDesign.js`
- `models/Inquiry.js`
- `controllers/realEstate.controller.js`
- `controllers/homeService.controller.js`
- `controllers/interiorDesign.controller.js`
- `routes/realEstate.routes.js`
- `routes/homeService.routes.js`
- `routes/interiorDesign.routes.js`

### Step 2 — Update server.js
Replace your existing `/server/server.js` with the one in this ZIP.  
It adds these three lines:
```js
app.use('/api/real-estate', require('./routes/realEstate.routes'));
app.use('/api/services',    require('./routes/homeService.routes'));
app.use('/api/interior',    require('./routes/interiorDesign.routes'));
```
And adds the user-specific socket rooms:
```js
io.on('connection', (socket) => {
  socket.on('join_user_room', (userId) => socket.join(`user_${userId}`));
});
```

### Step 3 — Update admin
Open `admin.phase3.js` and follow the instructions inside to paste the new methods and routes into your existing `admin.controller.js` and `admin.routes.js`.

### Step 4 — Copy client files
Copy the new `app/` pages and updated components into your existing `/client` directory.

### Step 5 — Update SocketContext
Replace your existing `context/SocketContext.jsx` with the updated version — it now emits `join_user_room` so users receive targeted notifications.

---

## New API Endpoints

### Real Estate `/api/real-estate`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List with filters |
| GET | `/:id` | Public | Single listing + increment views |
| POST | `/` | Required | Create listing |
| PUT | `/:id` | Owner/Admin | Update listing |
| DELETE | `/:id` | Owner/Admin | Delete |
| POST | `/:id/inquiry` | Required | Send inquiry to owner |
| GET | `/my` | Required | Owner's own listings |

### Home Services `/api/services`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Browse services |
| GET | `/:id` | Public | Service detail |
| POST | `/` | Required | List a service |
| POST | `/:serviceId/request` | Required | Book a job |
| PATCH | `/requests/:id/status` | Provider | Update job status |
| POST | `/requests/:id/review` | Client | Leave review after completion |
| GET | `/requests/my` | Required | My requests (`?role=client\|provider`) |

### Interior Design `/api/interior`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Portfolio gallery |
| GET | `/designers` | Public | All active designers |
| GET | `/:id` | Public | Project detail |
| POST | `/` | Required | Add portfolio project |
| POST | `/:designerId/request` | Required | Send design brief |
| PATCH | `/requests/:id` | Designer/Client | Update request (quote, status, message) |
| GET | `/requests/my` | Required | My requests (`?role=client\|designer`) |

---

## Real-Time Events (Socket.IO)

| Event | Direction | Trigger |
|---|---|---|
| `property_booked` | Server → All | When a rental is booked |
| `new_inquiry` | Server → Owner | When a real estate inquiry is sent |
| `new_service_request` | Server → Provider | When a client books a job |
| `request_status_updated` | Server → Client | When provider updates job status |
| `new_design_request` | Server → Designer | When a client sends a design brief |
| `design_request_updated` | Server → Other party | When status/quote changes |

---

## Testing Checklist

1. Register as user → go to `/real-estate/list` → submit a property
2. In MongoDB Atlas, set `isApproved: true` on that listing (or use admin panel)
3. Browse `/real-estate` → see your listing
4. Log in as another user → open listing → send an inquiry
5. First user should receive `new_inquiry` socket event
6. Test service listing at `/home-services/list`
7. Test service booking at `/home-services/[id]`
8. Test interior design request at `/interior-design/request?designer=DESIGNER_ID`
9. Check unified dashboard at `/dashboard/client`
