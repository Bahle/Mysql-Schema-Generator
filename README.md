A tool to automatically generate mysql schema, example:

$mydatabase
user
- name s80
- email text
- password c20
#(name: company i, delete: cascade, update: cascade)

post
- message text
- media s255

company
- name s80
- email s512
- tel s40

product
- name time
- price d8,6 n
- picture s255
- item_count i

-------------------------------------------------

string: s10
text t
timestamp: time
int: i
double
float: f10,3
decimal: d6,4
boolean: b
enum: e(Apple, Banana)
set: s(Cat, Dog)
char: c

n for null
\# for foreign key

No need to include id's, they are automatically created. e.g. for table user user_id would automatically be created with int AUTO_INCREMENT

-------------------

How to run: run npm run start or yarn start on your command line