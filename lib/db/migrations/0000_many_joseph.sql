CREATE TABLE "scraped_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"scraped_at" timestamp DEFAULT now(),
	CONSTRAINT "scraped_urls_user_id_url_unique" UNIQUE("user_id","url")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vector_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"vector_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "vector_metadata_vector_id_unique" UNIQUE("vector_id")
);
--> statement-breakpoint
ALTER TABLE "scraped_urls" ADD CONSTRAINT "scraped_urls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vector_metadata" ADD CONSTRAINT "vector_metadata_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vector_metadata" ADD CONSTRAINT "vector_metadata_url_scraped_urls_url_fk" FOREIGN KEY ("url") REFERENCES "public"."scraped_urls"("url") ON DELETE no action ON UPDATE no action;