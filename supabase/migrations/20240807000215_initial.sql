create policy "Authenticated users can do all flreew_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'documents'::text));


create policy "Authenticated users can do all flreew_1"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'documents'::text));


create policy "Authenticated users can do all flreew_2"
on "storage"."objects"
as permissive
for update
to public
using ((bucket_id = 'documents'::text));


create policy "Authenticated users can do all flreew_3"
on "storage"."objects"
as permissive
for delete
to public
using ((bucket_id = 'documents'::text));



