<?php	
/*
* Copyright (c) 2014 Mostafa Abdelraouf
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:

* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.

* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
* 
* https://github.com/drdrsh/scripts
*/

/*
	Steps:
	-------
	Create Content Categories
	Add MainMenu Items to MainMenu
	Create Menus
	Add menu items
	CreateModule
*/
defined('_JEXEC') or die;
$category = JTable::getInstance('Category');
$departments = array(
	"anatomy"		=> "Anatomy",
	"physiology"	=> "Physiology",
	"histology"		=> "Histology",
	"biochemistry"	=> "Biochemistry",
	"microbiology"	=> "Microbiology",
	"parasitology"	=> "Parasitology",
	"pharmacology"	=> "Pharmacology",
	"pathology" 	=> "Pathology",
	"community"		=> "Community Medicine",
	"forensic"		=> "Forensic Medicine",
	"ophthalmology"	=> "Ophthalmology",
	"ent"			=> "ENT",
	"gen_medicine"	=> "General Medicine",
	"gen_surgery" 	=> "General Surgery",
	"pediatrics" 	=> "Pediatrics",
	"obs_gyn"		=> "Obstetrics and gynaecology"
);

$categoriesPerDepartment = array(
	"gen"		=> "General", 
	"gen_news" 	=> "General News",
	"ug_news" 	=> "Undergraduate News",
	"pg_news" 	=> "Postgraduate News"
);


$articles = array(
	"gen" => array(
		array(
			"title" => "Home",
			"body" => "Welcome to {DEP} page"
		),
		array(
			"title" => "Staff",
			"body" => "Department Staff"
		),
		array(
			"title" => "Undergraduate Curriculum",
			"body" => "Undergraduate Curriculum (Coming soon)"
		),
		array(
			"title" => "Postgraduate Curriculum",
			"body" => "Postgraduate Curriculum (Coming soon)"
		)
	)
);

//var_dump(get_class_methods($category));die;

function cleanupContent(){
	$db = JFactory::getDbo();
    $sql = 'SELECT `id`, `asset_id` FROM `#__categories` WHERE `note`="auto_ext_gen"';
    $db->setQuery( $sql );
    $data = $db->loadObjectList();
	if(count($data) != 0){
		$cidArray = array();
		$cassetArray = array();
		foreach($data as $d){
			$cidArray[] = intval($d->id);
			$cassetArray[] = intval($d->asset_id);
		}

		$sql = 'SELECT `id`, `asset_id` FROM `#__content` WHERE `catid` IN ('.join(',', $cidArray).')';
		$db->setQuery( $sql );
		$data = $db->loadObjectList();
		if(count($data) != 0){
			$assetIDs = array();
			$contentIDs = array();
			foreach($data as $d){
				$contentIDs[] = intval($d->id);
				$assetIDs[] = intval($d->asset_id);
			}
			
			$sql = 'DELETE FROM `#__assets` WHERE id IN ('.join(',', $assetIDs).')';
			$db->setQuery( $sql );
			$db->query();

			$sql = 'DELETE FROM `#__content` WHERE id IN ('.join(',', $contentIDs).')';
			$db->setQuery( $sql );
			$db->query();
		}
		$sql = 'DELETE FROM `#__assets` WHERE id IN ('.join(',', $cassetArray).')';
		$db->setQuery( $sql );
		$db->query();

		$sql = 'DELETE FROM `#__categories` WHERE id IN ('.join(',', $cidArray).')';
		$db->setQuery( $sql );
		$db->query();
	}
	
	$sql = 'DELETE FROM `#__menu` WHERE `note` = "auto_ext_gen"';
	$db->setQuery( $sql );
	$db->query();
	
	$sql = 'DELETE FROM `#__menu_types` WHERE `description` = "auto_ext_gen"';
	$db->setQuery( $sql );
	$db->query();

    $sql = 'SELECT `id`,`asset_id` FROM `#__modules` WHERE `note`="auto_ext_gen"';
	$db->setQuery( $sql );
    $data = $db->loadObjectList();
	if(count($data) != 0){
		$midArray = array();
		$maidArray = array();
		foreach($data as $module){
			$midArray[] = intval($module->id);
			$maidArray[] = intval($module->asset_id);
		}
		$sql = 'DELETE FROM `#__modules_menu` WHERE `moduleid` IN ('.join(',', $midArray).')';
		$db->setQuery( $sql );
		$db->query();

		$sql = 'DELETE FROM `#__modules` WHERE `id` IN ('.join(',', $midArray) . ')';
		$db->setQuery( $sql );
		$db->query();

		$sql = 'DELETE FROM `#__assets` WHERE `id` IN ('.join(',', $maidArray) . ')';
		$db->setQuery( $sql );
		$db->query();
	}


}

function createSubMenuEntries($parentId, $type, $title, $articles, $categories){
    $menuTable = JTable::getInstance('MenuType', 'JTable', array());
	$menuData = array(
		'menutype' => $type,
		'title' => $title,
		'description' => 'auto_ext_gen'
	);

	// Bind data
	if (!$menuTable->bind($menuData))
	{	
		JError::raiseError(500, $menuTable->getError());
		return false;
	}

	// Check the data.
	if (!$menuTable->check())
	{
		JError::raiseError(500, $menuTable->getError());
		return false;
	}

	// Store the data.
	if (!$menuTable->store())
	{
		JError::raiseError(500, $menuTable->getError());
		return false;
	}

	$menuId = $menuTable->id;
	$menuItemIds = array();
	foreach($articles as $articleId => $articleTitle){
		$menuItemIds[] = createMenuEntry($type, $articleTitle, 'article', getAlias($type, $articleTitle), $articleId);
	}
	foreach($categories as $catId => $catTitle){
		$menuItemIds[] = createMenuEntry($type, $catTitle, 'category', getAlias($type, 'cat-'.$catTitle), $catId);
	}
	$menuItemIds[] = $parentId;
	createModule($type, 'position-7', $title, $menuItemIds);

	/*		
		Create menu type (simple row addition)
		Add all sub menu items to it while keeping track of the ids (Has some assets)
		create a module and have it display this menu type (save its ID)
		get all menu items + parentId and add them to the modules_menu table
	*/
}

function createModule($menuType, $position, $title, $itemIds){
	$db = JFactory::getDbo();
	$table = JTable::getInstance('Module', 'JTable', array());

	$data = array(
		'module' => 'mod_menu',
		'title' => $title,
		'note' => 'auto_ext_gen',
		'language' => '*',
		'published' => 1,
		'position' => $position,
		'params' =>'{"menutype":"' . $menuType .'","startLevel":"0", "endLevel":"0", "showAllChildren":"0", "tag_id":"", "class_sfx":"", "window_open":"","layout":"","moduleclass_sfx":"_menu","cache":"1","cache_time":"900","cachemode":"itemid"}'
	);

	// Bind data
	if (!$table->bind($data)){
		JError::raiseError(500, $table->getError());
		return false;
	}

	// Check the data.
	if (!$table->check()){
		JError::raiseError(500, $table->getError());
		return false;
	}

	// Store the data.
	if (!$table->store()){
		JError::raiseError(500, $table->getError());
		return false;
	}

	
	$moduleId = intval($table->id);
	
	foreach($itemIds as $item){
		$item = intval($item);
		$sql = "INSERT INTO `#__modules_menu` VALUES ($moduleId, $item)";
		$db->setQuery( $sql );
		$db->query();
	}

	return $moduleId;
}
function createMenuEntry($menu, $title, $type, $alias, $articleId){
	
	$menuTable = JTable::getInstance('Menu', 'JTable', array());

	$menuData = array(
		'menutype' => $menu,
		'title' => $title,
		'alias' => $alias,
		'type' => 'component',
		'component_id' => 22,
		'note' => 'auto_ext_gen',
		'link' => 
			$type == 'category'?
				'index.php?option=com_content&view=category&layout=blog&id='.$articleId:
				'index.php?option=com_content&view=article&id='.$articleId,
		'language' => '*',
		'published' => 1,
		'parent_id' => 1,
		'level' => 1,
		'params' => '{"show_title":"","link_titles":"","show_intro":"","info_block_position":"","show_category":"","link_category":"","show_parent_category":"","link_parent_category":"","show_author":"","link_author":"","show_create_date":"","show_modify_date":"","show_publish_date":"","show_item_navigation":"","show_vote":"","show_tags":"","show_icons":"","show_print_icon":"","show_email_icon":"","show_hits":"","show_noauth":"","urls_position":"","menu-anchor_title":"","menu-anchor_css":"","menu_image":"","menu_text":1,"page_title":"","show_page_heading":0,"page_heading":"","pageclass_sfx":"","menu-meta_description":"","menu-meta_keywords":"","robots":"","secure":0}'
	);

	$menuTable->setLocation(0, 'last-child');
	
	// Bind data
	if (!$menuTable->bind($menuData)){
		JError::raiseError(500, $menuTable->getError());
		return false;
	}

	// Check the data.
	if (!$menuTable->check()){
		JError::raiseError(500, $menuTable->getError());
		return false;
	}

	// Store the data.
	if (!$menuTable->store()){
		JError::raiseError(500, $menuTable->getError());
		return false;
	}
	
	// Rebuild the tree path.
	if (!$menuTable->rebuildPath($menuTable->id)) {
		JError::raiseError(500, $menuTable->getError());
		return false;
	}
	return $menuTable->id;
}

function getAlias($prefix, $title){ 
	return strtolower($prefix.'-'.str_replace(' ', '-', $title));
}
function createMainMenuEntry($dep, $title, $articleId){
	return createMenuEntry('mainmenu', $dep, 'article', getAlias('main', $dep . '-' . $title),  $articleId);
}

function createArticle($parentId, $title, $text){
	$table = JTable::getInstance('Content', 'JTable', array());

	$data = array(
		'catid' => $parentId,
		'title' => $title,
		'introtext' => $text,
		'fulltext' => '',
		'state' => 1,
	);

	// Bind data
	if (!$table->bind($data)){
		JError::raiseError(500, $table->getError());
		return false;
	}

	// Check the data.
	if (!$table->check()){
		JError::raiseError(500, $table->getError());
		return false;
	}

	// Store the data.
	if (!$table->store()){
		JError::raiseError(500, $table->getError());
		return false;
	}
	
	return $table->id;
}

function createCategory($parentId, $title, $description){
	// Get the database object
	$db = JFactory::getDbo();
	 	 
	// Initialize a new category
	$category = JTable::getInstance('Category');
	$category->extension = 'com_content';
	$category->note = 'auto_ext_gen';
	$category->title = $title;
	$category->description = $description;
	$category->published = 1;
	$category->access = 1;
	$category->params = '{"target":"","image":""}';
	$category->metadata = '{"page_title":"","author":"","robots":""}';
	$category->language = '*';
	 
	// Set the location in the tree
	$category->setLocation($parentId, 'last-child');
	 
	// Check to make sure our data is valid
	if (!$category->check()){
		JError::raiseError(500, $category->getError());
		return false;
	}
	 
	// Now store the category
	if (!$category->store(true)){
		JError::raiseError(500, $category->getError());
		return false;
	}
	
	// Build the path for our category
	$category->rebuildPath($category->id);
	return $category->id;
}

//Deletes all content from previous iterations
cleanupContent();

//Start generating content
foreach($departments as $depName => $depTitle){
	$categoryData = array();
	$articleData = array();
	foreach($categoriesPerDepartment as $cName => $cTitle){
		$catTitle =  $depTitle . ' Department category';
		$categoryId = createCategory(0, $depName . '_' . $cName, $catTitle);
		if(isset($articles[$cName]) && is_array($articles[$cName]) && count($articles[$cName]) != 0){
			foreach($articles[$cName] as $article){
				$article['title'] = str_replace('{DEP}', $depTitle, $article['title']);
				$article['body'] = str_replace('{DEP}', $depTitle, $article['body']);
				$articleId = createArticle($categoryId, $article['title'], $article['body']);
				$articleData[$articleId] = $article['title'];
			}
		}
		if($cName != 'gen'){
			$categoryData[$categoryId] = $cTitle;
		}
	}
	$firstArticleTitle = array_values($articleData)[0];
	$firstArticleId = array_keys($articleData)[0];
	$mainMenuItemId = createMainMenuEntry(ucfirst($depName), $firstArticleTitle, $firstArticleId);
	createSubMenuEntries($mainMenuItemId, $depName . '-menu', $depTitle . ' Department Menu', $articleData, $categoryData);

}