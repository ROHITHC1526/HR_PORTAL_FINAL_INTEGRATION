--
-- PostgreSQL database dump
--

\restrict GGRc43gZqPSojogy4Lypl2HIVVaq0VSja99ppfRBoBxnbWagp4wDsvwUjGWOjEf

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: candidate_trackers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_trackers (
    id character varying(50) NOT NULL,
    full_name character varying(255) NOT NULL,
    applied_for character varying(255) NOT NULL,
    source character varying(100) DEFAULT 'Careers Page'::character varying,
    total_experience integer DEFAULT 3,
    expected_ctc bigint DEFAULT 1500000,
    stage character varying(50) DEFAULT 'Applied'::character varying,
    email character varying(255) NOT NULL,
    phone character varying(50) DEFAULT ''::character varying,
    status character varying(50) DEFAULT 'Active'::character varying,
    archived boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.candidate_trackers OWNER TO postgres;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    job_id integer,
    job_title character varying(255) NOT NULL,
    skills text NOT NULL,
    status character varying(50) DEFAULT 'Applied'::character varying NOT NULL,
    applied_date character varying(100) DEFAULT 'Today'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidates_id_seq OWNER TO postgres;

--
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- Name: employee_attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_attendance (
    id character varying(50) NOT NULL,
    employee_id character varying(50) NOT NULL,
    date character varying(50) NOT NULL,
    punch_in character varying(50) NOT NULL,
    punch_out character varying(50),
    work_hours character varying(50) DEFAULT '8h 00m'::character varying,
    status character varying(50) DEFAULT 'Present'::character varying
);


ALTER TABLE public.employee_attendance OWNER TO postgres;

--
-- Name: employee_leaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_leaves (
    id character varying(50) NOT NULL,
    employee_id character varying(50) NOT NULL,
    leave_type character varying(50) NOT NULL,
    from_date character varying(50) NOT NULL,
    to_date character varying(50) NOT NULL,
    days integer NOT NULL,
    reason text,
    status character varying(50) DEFAULT 'Pending'::character varying
);


ALTER TABLE public.employee_leaves OWNER TO postgres;

--
-- Name: employee_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_profiles (
    employee_id character varying(50) NOT NULL,
    full_name character varying(255) NOT NULL,
    work_email character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    department character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'Active'::character varying,
    phone character varying(50) DEFAULT ''::character varying,
    dob character varying(50) DEFAULT ''::character varying,
    blood_group character varying(20) DEFAULT ''::character varying,
    address text DEFAULT ''::text,
    emergency_contact character varying(100) DEFAULT ''::character varying,
    manager character varying(255) DEFAULT ''::character varying,
    grade character varying(50) DEFAULT ''::character varying,
    location character varying(255) DEFAULT ''::character varying,
    doj character varying(50) DEFAULT ''::character varying,
    bank_name character varying(100) DEFAULT ''::character varying,
    bank_account character varying(100) DEFAULT ''::character varying,
    ifsc character varying(50) DEFAULT ''::character varying,
    pan character varying(50) DEFAULT ''::character varying,
    uan character varying(50) DEFAULT ''::character varying,
    nominee_name character varying(100) DEFAULT ''::character varying,
    nominee_relation character varying(50) DEFAULT ''::character varying
);


ALTER TABLE public.employee_profiles OWNER TO postgres;

--
-- Name: employee_referrals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_referrals (
    id character varying(50) NOT NULL,
    candidate_name character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    referred_by character varying(255) NOT NULL,
    bonus integer DEFAULT 30000,
    status character varying(50) DEFAULT 'Applied'::character varying,
    date character varying(50) DEFAULT 'Today'::character varying
);


ALTER TABLE public.employee_referrals OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    department character varying(255) NOT NULL,
    grade character varying(50) DEFAULT 'L3'::character varying,
    location character varying(255) DEFAULT 'Hyderabad'::character varying,
    manager character varying(255) DEFAULT 'Ananya Rao'::character varying,
    status character varying(50) DEFAULT 'Active'::character varying,
    email character varying(255) NOT NULL,
    joined_date character varying(100) DEFAULT 'Oct 01, 2026'::character varying
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goals (
    id integer NOT NULL,
    employee_id character varying(50) NOT NULL,
    employee_name character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    target_date character varying(50) NOT NULL,
    progress integer DEFAULT 0,
    status character varying(50) DEFAULT 'In Progress'::character varying
);


ALTER TABLE public.goals OWNER TO postgres;

--
-- Name: interviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    candidate_id integer,
    candidate_name character varying(255) NOT NULL,
    candidate_email character varying(255) NOT NULL,
    job_title character varying(255) NOT NULL,
    interview_date character varying(100) NOT NULL,
    formatted_date character varying(100) NOT NULL,
    interviewer character varying(255) NOT NULL,
    interview_type character varying(100) NOT NULL,
    notes text DEFAULT ''::text,
    status character varying(50) DEFAULT 'Scheduled'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    round character varying(100),
    mode character varying(50),
    "time" character varying(50),
    venue_link character varying(255),
    rating integer DEFAULT 0,
    result character varying(50) DEFAULT 'Pending'::character varying,
    feedback text DEFAULT ''::text,
    archived boolean DEFAULT false
);


ALTER TABLE public.interviews OWNER TO postgres;

--
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interviews_id_seq OWNER TO postgres;

--
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    department character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    skills text NOT NULL,
    status character varying(50) DEFAULT 'Active'::character varying NOT NULL,
    posted_date character varying(100) DEFAULT 'Today'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: manpower_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.manpower_requirements (
    id character varying(50) NOT NULL,
    designation character varying(255) NOT NULL,
    department character varying(255) NOT NULL,
    positions integer DEFAULT 1 NOT NULL,
    employment_type character varying(100) DEFAULT 'Full-time'::character varying,
    location character varying(255) DEFAULT 'Hyderabad'::character varying,
    experience character varying(100) DEFAULT '2-5'::character varying,
    budget_ctc character varying(100) DEFAULT '120000'::character varying,
    reason character varying(255) DEFAULT 'New position'::character varying,
    replacing character varying(255) DEFAULT '—'::character varying,
    hiring_manager character varying(255) DEFAULT '—'::character varying,
    required_by character varying(100) DEFAULT 'Feb 20, 2020'::character varying,
    status character varying(50) DEFAULT 'Approved'::character varying,
    job_description text DEFAULT ''::text,
    created_at character varying(100),
    updated_at character varying(100),
    archived boolean DEFAULT false
);


ALTER TABLE public.manpower_requirements OWNER TO postgres;

--
-- Name: offer_letters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offer_letters (
    id character varying(50) NOT NULL,
    candidate_id character varying(50),
    candidate_name character varying(255) NOT NULL,
    designation character varying(255) NOT NULL,
    annual_ctc character varying(100) NOT NULL,
    joining_date character varying(100) NOT NULL,
    valid_till character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'Pending approval'::character varying,
    archived boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.offer_letters OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    employee_id character varying(50) NOT NULL,
    employee_name character varying(255) NOT NULL,
    reviewer_name character varying(255) NOT NULL,
    cycle character varying(50) NOT NULL,
    rating integer DEFAULT 4,
    feedback text NOT NULL,
    status character varying(50) DEFAULT 'Completed'::character varying,
    updated_at character varying(50) DEFAULT 'Today'::character varying
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(100) DEFAULT 'Recruiter'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: candidate_trackers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_trackers (id, full_name, applied_for, source, total_experience, expected_ctc, stage, email, phone, status, archived, created_at) FROM stdin;
CAN-001	Rahul Varma	Senior ML Engineer	LinkedIn	4	2800000	Interview	rahul.varma@brightcone.ai	+91 98765 43210	Active	f	2026-10-19 14:00:37.363584+05:30
CAN-002	Siddharth Rao	Full-Stack Developer	Careers Page	3	2200000	Screening	siddharth.rao@example.com	+91 98450 12345	Active	f	2026-10-19 14:00:37.363584+05:30
CAN-003	Neha Bansal	QA Automation Lead	Referral	5	2500000	Interview	neha.bansal@example.com	+91 91234 56789	Active	f	2026-10-19 14:00:37.363584+05:30
CAN-004	Aarav Sharma	AI Systems Architect	Direct	7	4500000	Applied	aarav.sharma@example.com	+91 99887 76655	Active	f	2026-10-19 14:00:37.363584+05:30
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, name, email, job_id, job_title, skills, status, applied_date, created_at) FROM stdin;
1	Aarav Sharma	aarav.sharma@example.com	1	Senior Rust Backend Engineer	Rust, Tokio, Axum, Concurrency, Linux	Shortlisted	2026-10-10	2026-10-14 15:48:15.914186+05:30
2	Elena Rostova	elena.rostova@example.com	2	Full-Stack Product Developer	TypeScript, React, Design Systems, REST	Interview	2026-10-11	2026-10-14 15:48:15.914186+05:30
3	Marcus Vance	m.vance@techpulse.io	1	Senior Rust Backend Engineer	C++, Rust, Concurrency, Low-latency	Applied	2026-10-12	2026-10-14 15:48:15.914186+05:30
4	Priya Patel	priya.patel@brightcone.hr	3	Technical Talent Acquisition Lead	Talent Strategy, ATS, Technical Hiring	Selected	2026-10-08	2026-10-14 15:48:15.914186+05:30
5	David Kim	david.kim@samplecorp.org	4	Cloud Infrastructure & DevOps Lead	AWS, Terraform, Docker, Python	Rejected	2026-10-05	2026-10-14 15:48:15.914186+05:30
6	rohith	sdf@gmail.com	1	Senior Rust Backend Engineer	sdf	Applied	Today	2026-10-14 15:59:51.892278+05:30
7	maniiiii	asdf@gmail.com	1	Senior Rust Backend Engineer	dasdas	Applied	Today	2026-10-15 11:47:00.724601+05:30
\.


--
-- Data for Name: employee_attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_attendance (id, employee_id, date, punch_in, punch_out, work_hours, status) FROM stdin;
ATT-101	BC-1038	2026-10-15	09:15 AM	06:30 PM	8h 45m	Present
ATT-102	BC-1038	2026-10-16	09:05 AM	\N	In progress	Present
\.


--
-- Data for Name: employee_leaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_leaves (id, employee_id, leave_type, from_date, to_date, days, reason, status) FROM stdin;
LV-101	BC-1038	Casual leave	2026-10-09	2026-10-09	1	Personal family event	Approved
LV-102	BC-1038	Sick leave	2026-09-14	2026-09-15	2	Viral fever recovery	Approved
\.


--
-- Data for Name: employee_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_profiles (employee_id, full_name, work_email, role, department, status, phone, dob, blood_group, address, emergency_contact, manager, grade, location, doj, bank_name, bank_account, ifsc, pan, uan, nominee_name, nominee_relation) FROM stdin;
BC-1038	Rahul Varma	rahul.varma@brightcone.ai	Backend Engineer	Engineering	Active	+91 98480 11038	Oct 7, 1996	B+	Flat 402, Aparna Towers, Kondapur, Hyderabad 500084	Lakshmi Varma (Mother), +91 98490 22110	Priya Menon	L4	Hyderabad	Feb 15, 2024	HDFC Bank	50100492817291	HDFC0001234	ABCDE1234F	100984920194	Lakshmi Varma	Mother
\.


--
-- Data for Name: employee_referrals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_referrals (id, candidate_name, role, referred_by, bonus, status, date) FROM stdin;
RF-001	wffs	Senior ML Engineer	rahul.varma@brightcone.ai	50000	Applied	Oct 15, 2026
RF-002	Siddharth Rao	QA Automation Lead	rahul.varma@brightcone.ai	30000	Interview	Oct 12, 2026
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, name, role, department, grade, location, manager, status, email, joined_date) FROM stdin;
BC-1001	Naresh Vemparala	Founder & CEO	Leadership	L9	Hyderabad	no manager	Active	naresh@brightcone.ai	Oct 01, 2026
BC-1004	Ananya Rao	People Ops Lead	People Ops	L6	Hyderabad	Naresh Vemparala	Active	ananya.rao@brightcone.ai	Oct 01, 2026
BC-1012	Karthik Reddy	Principal AI Engineer	AI Research	L8	Hyderabad	Naresh Vemparala	Active	karthik.reddy@brightcone.ai	Oct 01, 2026
BC-1019	Priya Menon	Engineering Manager	Engineering	L7	Bengaluru	Karthik Reddy	Active	priya.menon@brightcone.ai	Oct 01, 2026
BC-1038	Rahul Varma	Backend Engineer	Engineering	L4	Hyderabad	Priya Menon	Active	rahul.varma@brightcone.ai	Oct 01, 2026
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goals (id, employee_id, employee_name, title, category, target_date, progress, status) FROM stdin;
1	BC-1012	Karthik Reddy	Deploy Distributed Vector LLM Serving Engine in Rust	Innovation	2026-11-15	85	In Progress
2	BC-1038	Rahul Varma	Migrate Core Database Schema to PostgreSQL 18 & Optimize Connection Pool	Engineering	2026-10-31	90	In Progress
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, candidate_id, candidate_name, candidate_email, job_title, interview_date, formatted_date, interviewer, interview_type, notes, status, created_at, round, mode, "time", venue_link, rating, result, feedback, archived) FROM stdin;
1	2	Elena Rostova	elena.rostova@example.com	Full-Stack Product Developer	2026-10-16T14:00	Oct 16, 2026 at 02:00 PM	Sarah Jenkins (Engineering Manager)	System Design	Discuss component modularity and client-server sync patterns.	Scheduled	2026-10-14 15:48:15.924858+05:30	\N	\N	\N	\N	0	Pending		f
2	1	Aarav Sharma	aarav.sharma@example.com	Senior Rust Backend Engineer	2026-10-17T11:30	Oct 17, 2026 at 11:30 AM	Vikram Malhotra (Staff Architect)	Technical Screening	Focus on memory management, async runtime, and error handling.	Scheduled	2026-10-14 15:48:15.924858+05:30	\N	\N	\N	\N	0	Pending		f
3	6	rohith	sdf@gmail.com	Senior Rust Backend Engineer	2026-10-23T17:39	2026-10-23 17:39	sara	Technical Screening		Scheduled	2026-10-14 17:39:22.912477+05:30	\N	\N	\N	\N	0	Pending		f
4	2	Siddharth Rao	elena.rostova@example.com	Full-Stack Product Developer	2026-10-24	2026-10-24	Sarah Jenkins	Technical 1		Scheduled	2026-10-19 15:25:53.440398+05:30	Technical 1	Video call	11:00 AM	https://meet.google.com/test-meet-link	4	Pass	Strong problem solving skills and clean code architecture.	f
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, title, department, location, skills, status, posted_date, created_at) FROM stdin;
1	Senior Rust Backend Engineer	Engineering	San Francisco, CA (Hybrid)	Rust, Axum, Tokio, Distributed Systems	Active	Oct 01, 2026	2026-10-14 15:09:27.982214+05:30
2	Full-Stack Product Developer	Product	New York, NY (Remote)	TypeScript, React, Rust, UI/UX	Active	Oct 04, 2026	2026-10-14 15:09:27.982214+05:30
3	Technical Talent Acquisition Lead	Human Resources	Bangalore, India (On-site)	Tech Recruiting, ATS, Sourcing, Hiring Strategy	Active	Oct 08, 2026	2026-10-14 15:09:27.982214+05:30
4	Cloud Infrastructure & DevOps Lead	Infrastructure	Remote	Kubernetes, CI/CD, AWS, Terraform	Active	Oct 11, 2026	2026-10-14 15:09:27.982214+05:30
5	PYTHON	Engineering	Hyderabad	TypeScript, Rust, React, System Design	Active	Today	2026-10-19 13:17:45.186729+05:30
6	JAVA	Engineering	Hyderabad	TypeScript, Rust, React, System Design	Active	Today	2026-10-19 13:18:19.932225+05:30
7	a	Engineering	Hyderabad	TypeScript, Rust, React, System Design	Active	Today	2026-10-19 13:32:28.682631+05:30
8	Lead AI Research Scientist	AI Research	Hyderabad (Hybrid)	PyTorch, CUDA, Transformers, Rust	Active	Today	2026-10-19 15:22:07.776852+05:30
\.


--
-- Data for Name: manpower_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.manpower_requirements (id, designation, department, positions, employment_type, location, experience, budget_ctc, reason, replacing, hiring_manager, required_by, status, job_description, created_at, updated_at, archived) FROM stdin;
MR-0001	asa	ss	2	Full-time	sed	2	120000	New position	—	—	Feb 20, 2020	Overdue	sswefg	15 Oct 2026, 4:17 pm	19 Oct 2026, 12:21 pm	f
MR-0002	Senior ML Engineer	AI Research	3	Full-time	Hyderabad	3-5	3500000	Expansion	—	Karthik Reddy	Nov 30, 2026	Approved	Core ML platform development in Rust & Python	16 Oct 2026, 10:00 am	19 Oct 2026, 11:30 am	f
\.


--
-- Data for Name: offer_letters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offer_letters (id, candidate_id, candidate_name, designation, annual_ctc, joining_date, valid_till, status, archived, created_at) FROM stdin;
OFF-001	CAN-002	Siddharth Rao	Full-Stack Developer	₹22,00,000	Nov 15, 2026	Oct 25, 2026	Draft	t	2026-10-19 14:00:37.365053+05:30
OFF-002	CAN-002	Siddharth Rao	Senior Full-Stack Developer	?28,00,000	Dec 01, 2026	Nov 10, 2026	Pending approval	f	2026-10-19 15:27:27.694361+05:30
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, employee_id, employee_name, reviewer_name, cycle, rating, feedback, status, updated_at) FROM stdin;
1	BC-1038	Rahul Varma	Priya Menon (Engineering Manager)	Q3 2026 Mid-Year	5	Rahul has demonstrated extraordinary ownership of backend Rust services.	Completed	Oct 10, 2026
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, created_at) FROM stdin;
1	Recruitment Admin	admin@brightcone.ai	admin123	Senior Talent Lead	2026-10-14 15:09:27.980164+05:30
2	HR Specialist	hr@brightcone.ai	password123	Recruiter	2026-10-14 15:09:27.980164+05:30
3	Maya Lin	maya@brightcone.ai	secure123	Technical Recruiter	2026-10-14 15:45:26.300953+05:30
4	Test Manager	manager@brightcone.ai	password123	Hiring Manager	2026-10-14 17:17:26.401834+05:30
5	ROHITH	r@brightcone.ai	1234567890	Technical Recruiter	2026-10-14 17:23:43.349042+05:30
6	dev	dev@brightcone.ai	1234567890	Employee	2026-10-16 11:43:16.159728+05:30
\.


--
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidates_id_seq', 1, false);


--
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: candidate_trackers candidate_trackers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_trackers
    ADD CONSTRAINT candidate_trackers_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: employee_attendance employee_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_attendance
    ADD CONSTRAINT employee_attendance_pkey PRIMARY KEY (id);


--
-- Name: employee_leaves employee_leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_leaves
    ADD CONSTRAINT employee_leaves_pkey PRIMARY KEY (id);


--
-- Name: employee_profiles employee_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_pkey PRIMARY KEY (employee_id);


--
-- Name: employee_referrals employee_referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_referrals
    ADD CONSTRAINT employee_referrals_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: manpower_requirements manpower_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manpower_requirements
    ADD CONSTRAINT manpower_requirements_pkey PRIMARY KEY (id);


--
-- Name: offer_letters offer_letters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT offer_letters_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: interviews interviews_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict GGRc43gZqPSojogy4Lypl2HIVVaq0VSja99ppfRBoBxnbWagp4wDsvwUjGWOjEf

