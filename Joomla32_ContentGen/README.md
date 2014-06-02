Joomla! 3.2 Content Generator
=========


This is a small component code that generates a large set of categories/articles/menu items/modules programatically. I wrote it to help me with the initial content generation for a website I was buliding that featured many departments (32 or so) each having similar set of menu items.


What it does
----

The code runs within the context of Joomla! framework, You might need to wrap it in an extension and add the proper database record in #__extensions table

It starts off by reading a php array containing
  - The names of the departments.
  - A list of categories to put under each departments.
  - Articles to auto generate under each category

It then proceeds to generate categories and articles. Aftewards it proceeds to create a menu-type and places links to these articles in that new menu-type. It then creates a module and set the menu-assignments for that module, I wanted each menu-type to be visible only while browsing that particular department and not while browsing other departments.

Disclaimer
----
The code is pretty messy and poorly documented, I am putting it here for future reference and that it might end up helping someone somewhere.


License
----

MIT
